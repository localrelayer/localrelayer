import express from 'express';
import https from 'https';
import http from 'http';
import socketIo from 'socket.io';
import socketIoRedis from 'socket.io-redis';
import fs from 'fs';

import config from './config';

const app = express();
let server = null;
if (config.SSL) {
  server = https.createServer(
    {
      key: fs.readFileSync('./key.pem'),
      cert: fs.readFileSync('./cert.pem'),
      passphrase: 'chat'
    },
    app
  );
} else {
  server = http.createServer(app);
}
const io = socketIo(server);
io.adapter(socketIoRedis({
  host: config.redis.host,
  port: config.redis.port,
}));
const {
  port,
} = config;

server.listen(port, () => {
  console.log(`Server listening at port ${port}`);
});

io.on('connection', (socket) => {
  socket.on('login', ({ address }) => {
    console.log('-------');
    console.log('login');
    console.log(address);
    console.log('-------');
    socket.join(address);
    socket.userData = {
      socketId: socket.id,
      address,
    };
  });

  socket.on('disconnect', () => {
    console.log('-------');
    console.log('disconnect');
    console.log(socket.userData);
    console.log('-------');
  });
});
