import redis from 'redis';
import wrapper from 'co-redis';

import config from 'config';


export const redisClient = redis.createClient({
  port: config.redis.port,
  host: config.redis.host,
  password: config.redis.password,
  return_buffers: false,
});
export const coRedisClient = wrapper(redisClient.duplicate());
