import WebSocket from 'ws';
import https from 'https';
import fs from 'fs';

import {
  redisClient,
  coRedisClient,
} from '../redis';
import config from '../config';


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
  console.log(`Server listening on port ${wssAddress.port}`);
});

wss.on('connection', (ws) => {
  console.log('connected');

  ws.subscriptions = {};

  ws.isAlive = true;
  ws.on('pong', () => {
    ws.isAlive = true;
  });

  ws.on('message', (message) => {
    console.log('received: %s', message);
    const data = JSON.parse(message);
    console.log(data);

    if (
      data.type === 'subscribe'
      && data.requestId
    ) {
      console.log('subscribe');
      ws.subscriptions[data.requestId] = data;
    }

    if (
      data.type === 'unsubscribe'
      && data.requesId
    ) {
      console.log('unsubscribe');
      ws.subscriptions[data.requesId] = null;
    }
    console.log(ws.subscriptions);
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
        console.log('SEND!!!');
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
