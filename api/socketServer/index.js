import WebSocket from 'ws';
import https from 'https';
import fs from 'fs';

import {
  redisClient,
  coRedisClient,
} from '../redis';
import config from '../config';
import {
  createLogger,
} from '../logger';

export const logger = createLogger(
  'socketServer',
//  'info',
);
logger.debug('socketServer logger was created');

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

    ws.isAlive = true;
    ws.on('pong', () => {
      ws.isAlive = true;
    });

    ws.on('message', (message) => {
      logger.debug(`received: ${message}`);
      const data = JSON.parse(message);

      if (
        data.type === 'subscribe'
        && data.requestId
      ) {
        logger.debug('subscribe');
        ws.subscriptions[data.requestId] = data;
      }

      if (
        data.type === 'unsubscribe'
        && data.requesId
      ) {
        logger.debug('unsubscribe');
        ws.subscriptions[data.requesId] = null;
      }
      logger.debug(ws.subscriptions);
    });
  });

  const redisSub = redisClient.duplicate();
  redisSub.on('message', async (channel, message) => {
    const tradingInfo = JSON.parse(await coRedisClient.get(message));

    wss.clients.forEach((client) => {
      Object.keys(client.subscriptions).forEach((subId) => {
        const sub = client.subscriptions[subId];
        if (
          sub.channel === 'tradingInfo'
          && (
            sub.payload.pairs.some(
              pair => (
                pair.networkId === tradingInfo.networkId
                && (
                  (
                    pair.assetDataA === tradingInfo.assetDataA
                    && pair.assetDataB === tradingInfo.assetDataB
                  ) || (
                    pair.assetDataB === tradingInfo.assetDataA
                    && pair.assetDataA === tradingInfo.assetDataB
                  )
                )),
            )
          )
        ) {
          logger.debug('SEND!!!');
          client.send(JSON.stringify({
            type: 'update',
            channel: 'tradingInfo',
            requestId: sub.requestId,
            payload: [
              tradingInfo,
            ],
          }));
        }
      });
    });
  });
  redisSub.subscribe('tradingInfo');

  if (server) {
    server.listen(config.socketPort);
  }
  return wss;
}
