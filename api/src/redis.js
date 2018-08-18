import redis from 'redis';
import wrapper from 'co-redis';

export default wrapper(redis.createClient());
