import redis from 'redis';
import socketIo from 'socket.io-emitter';

import config from '../config';


const socketpub = redis.createClient({
  port: config.redis.port,
  host: config.redis.host,
  password: config.redis.password,
  return_buffers: true,
});
const io = socketIo(socketpub);

export default {
  io,
  socketpub,
};
