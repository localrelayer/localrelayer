import express from 'express';
import https from 'https';
import http from 'http';
import socketIo from 'socket.io';
import socketIoRedis from 'socket.io-redis';
import fs from 'fs';

import config from '../../config';
import {
  Order,
} from '../db';
import redisClient from '../redis';


const app = express();
let server = null;
if (config.SSL) {
  server = https.createServer(
    {
      key: fs.readFileSync('./key.pem'),
      cert: fs.readFileSync('./cert.pem'),
      passphrase: 'passphrase',
    },
    app,
  );
} else {
  server = http.createServer(app);
}
const io = socketIo(server);
io.adapter(socketIoRedis({
  host: config.redis.host,
  port: config.redis.port,
}));
const { port } = config;

server.listen(port, () => {
  console.log(`Server listening at port ${port}`);
});

io.on('connection', (socket) => {
  console.log('connected');

  socket.on('getTradingHistory', async ({
    makerAssetData,
    takerAssetData,
  }) => {
    const orders = await Order.find({
      $or: [{
        makerAssetData,
        takerAssetData,
      }, {
        makerAssetData: takerAssetData,
        takerAssetData: makerAssetData,
      }],
    })
      .limit(500)
      .sort('-completedAt');

    socket.emit('message', {
      orders,
    });
  });

  socket.on('subscribe', async ({ pairs }) => {
    const allPairs = [
      ...pairs,
      ...pairs.map(p => p.split('_').reverse().join('_')),
    ];
    socket.join(allPairs);
    console.log('-------');
    console.log('subscribed', allPairs);

    const rawPairsTradingInfo = await Promise.all(
      allPairs.map(
        pair => (
          redisClient.get(pair)
            .then(
              data => ({
                tradingInfo: JSON.parse(data),
                pair,
              }),
            )
        ),
      ),
    );
    const pairsTradingInfo = rawPairsTradingInfo.filter(p => p.tradingInfo);
    if (pairsTradingInfo.length) {
      socket.emit('message', {
        tradingInfo: pairsTradingInfo,
      });
    }
    console.log('-------');
  });

  socket.on('unsubscribe', async ({ pair }) => {
    console.log('-------');
    socket.leave([
      pair,
      pair.split('_').reverse().join('_'),
    ]);
    console.log('unsubscribed', pair);
    console.log('-------');
  });

  socket.on('disconnect', () => {
    console.log('-------');
    console.log('disconnected', socket.id);
    console.log('-------');
  });
});
