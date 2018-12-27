import '../aliases';
import WebSocket from 'ws';
import https from 'https';
import fs from 'fs';
import {
  SchemaValidator,
  schemas,
} from '@0x/json-schemas';

import {
  redisClient,
  coRedisClient,
} from 'redisClient';
import config from 'config';
import {
  createLogger,
} from 'logger';
import {
  clearOrderFields,
} from 'utils';


const logger = createLogger(
  'socketServer',
  process.env.LOG_LEVEL || 'silly',
  (
    process.env.DASHBOARD_PARENT !== 'true'
  ),
);
logger.debug('socketServer logger was created');
// Check if val1 doesn't exist or equal to val1
const shouldExistAndEqual = (val1, val2) => (val1 ? val1 === val2 : true);
const validator = new SchemaValidator();

export function runWebSocketServer() {
  let server = null;
  if (config.SSL) {
    server = https.createServer(
      {
        key: fs.readFileSync('./key.pem'),
        cert: fs.readFileSync('./cert.pem'),
        passphrase: 'passphrase',
      },
    );
  }

  const wss = new WebSocket.Server({
    ...(!server ? { port: config.socketPort } : {}),
    ...(server ? { server } : {}),
    clientTracking: true,
  });

  wss.on('listening', () => {
    const wssAddress = wss.address();
    logger.info(`Server listening on port ${wssAddress.port}`);
  });

  wss.on('connection', (ws) => {
    logger.debug('ws client connected');

    ws.subscriptions = {};
    ws.pingTimeout = null;

    ws.on('message', (message) => {
      logger.debug(`received: ${message}`);
      if (message === 'ping') {
        if (ws.pingTimeout) {
          clearTimeout(ws.pingTimeout);
        }
        ws.pingTimeout = setTimeout(() => {
          if (ws.readyState === 1) {
            ws.send('pong');
          }
        }, 1000);
      } else {
        const data = JSON.parse(message);
        console.log(data);

        if (
          data.type === 'subscribe'
          && data.requestId
          && validator.isValid(data, schemas.relayerApiOrdersChannelSubscribePayloadSchema)
        ) {
          logger.debug('subscribe');
          ws.subscriptions[data.requestId] = data;
        }

        if (
          data.type === 'unsubscribe'
          && data.requestId
        ) {
          logger.debug('unsubscribe');
          ws.subscriptions[data.requestId] = null;
        }
        logger.debug(ws.subscriptions);
      }
    });
  });

  const redisSub = redisClient.duplicate();
  redisSub.on('message', async (channel, message) => {
    const [tradingInfoRedisKeyMakerTaker, tradingInfoRedisKeyTakerMaker] = message.split('^');
    const tradingInfoMakerTaker = JSON.parse(
      await coRedisClient.get(tradingInfoRedisKeyMakerTaker),
    );
    const tradingInfoTakerMaker = JSON.parse(
      await coRedisClient.get(tradingInfoRedisKeyTakerMaker),
    );

    wss.clients.forEach((client) => {
      Object.keys(client.subscriptions).forEach((subId) => {
        const sub = client.subscriptions[subId];
        if (
          sub
          && sub.channel === 'tradingInfo'
          && (
            sub.payload.pairs.some(
              pair => (
                pair.networkId === tradingInfoMakerTaker.networkId
                && (
                  (
                    pair.assetDataA === tradingInfoMakerTaker.assetDataA
                    && pair.assetDataB === tradingInfoMakerTaker.assetDataB
                  ) || (
                    pair.assetDataA === tradingInfoTakerMaker.assetDataA
                    && pair.assetDataB === tradingInfoTakerMaker.assetDataB
                  )
                )),
            )
          )
        ) {
          logger.debug('SEND TRADING INFO!!!');
          if (client.readyState === 1) {
            client.send(JSON.stringify({
              type: 'update',
              channel: 'tradingInfo',
              requestId: sub.requestId,
              payload: [
                tradingInfoMakerTaker,
                tradingInfoTakerMaker,
              ],
            }));
          }
        }
      });
    });
  });
  redisSub.subscribe('tradingInfo');

  const redisSRA = redisClient.duplicate();
  redisSRA.on('message', async (channel, message) => {
    logger.debug('ORDER');
    logger.debug(message);
    const {
      order,
      metaData,
    } = JSON.parse(message);

    wss.clients.forEach((client) => {
      Object.keys(client.subscriptions).forEach((subId) => {
        const sub = client.subscriptions[subId];
        if (
          sub
          && sub.channel === 'orders'
          && metaData.networkId === (sub.payload.networkId || 1)
          && shouldExistAndEqual(sub.payload.makerAssetProxyId, order.makerAssetProxyId)
          && shouldExistAndEqual(sub.payload.takerAssetProxyId, order.takerAssetProxyId)
          && shouldExistAndEqual(sub.payload.makerAssetAddress, order.makerAssetAddress)
          && shouldExistAndEqual(sub.payload.takerAssetAddress, order.takerAssetAddress)
          && (
            (
              shouldExistAndEqual(sub.payload.makerAssetData, order.makerAssetData)
              || shouldExistAndEqual(sub.payload.makerAssetData, order.takerAssetData)
            )
            || (
              shouldExistAndEqual(sub.payload.takerAssetData, order.takerAssetData)
              || shouldExistAndEqual(sub.payload.takerAssetData, order.makerAssetData)
            )
          )
          && (
            shouldExistAndEqual(sub.payload.traderAssetData, order.makerAssetData)
            || shouldExistAndEqual(sub.payload.traderAssetData, order.takerAssetData)
          )
        ) {
          logger.debug('SEND ORDER!!!');
          logger.debug(order);
          logger.debug(metaData);

          const clearOrder = clearOrderFields(order);
          if (client.readyState === 1) {
            client.send(JSON.stringify({
              type: 'update',
              channel: 'orders',
              requestId: sub.requestId,
              payload: [{
                order: clearOrder,
                metaData,
              }],
            }));
          }
        }
      });
    });
  });
  redisSRA.subscribe('orders');

  if (server) {
    server.listen(config.socketPort);
  }
  return wss;
}

if (require.main === module) {
  runWebSocketServer();
}
