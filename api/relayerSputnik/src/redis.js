import redis from 'redis';
import wrapper from 'co-redis';

const redisClient = wrapper(redis.createClient());

export default redisClient;
