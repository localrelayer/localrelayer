import redisClient from '../redis';
import BigNumber from '../utils/BigNumber';
import socket from '../socket';
import { appLogger as logger } from '../utils/logger';

// Orders volume (sum of all completed orders amounts)
const getVolume = orders => orders.reduce((acc, ord) => acc.add(ord.amount), BigNumber(0)).toNumber().toFixed(12);
// Orders eth volume (sum of all completed orders total)
const getEthVolume = orders => orders.reduce((acc, ord) => acc.add(ord.total), BigNumber(0)).toNumber().toFixed(12);

// Get last price
const getLastPrice = orders => BigNumber(orders[orders.length - 1].price).toNumber().toFixed(12);

// Find percentage diff between last and first orders (in 24 hour)
const getChange = (orders) => {
  const diff = BigNumber(getLastPrice(orders)).div(orders[0].price);
  const percentageDiff = diff.minus(1).times(100);
  return percentageDiff.toNumber().toFixed(2);
};

const getHigh = orders => BigNumber.max(...orders.map(o => o.price)).toNumber().toFixed(12);
const getLow = orders => BigNumber.min(...orders.map(o => o.price)).toNumber().toFixed(12);

// Update Trading Info in redis (regularly called after new order matching)
export const updateTradingInfo = async (orders) => {
  Promise.all(
    orders.map((order) => {
      const {
        token_address,
        price,
        amount,
        id,
        completed_at,
        total,
      } = order.attributes;

      return redisClient.set(
        `${token_address}:${id}`,
        JSON.stringify({ price, amount, total, completed_at }),
        'EX', 60 * 60 * 24);
    })
  ).catch((e) => {
    logger.log('error', 'Redis error');
    console.error(e);
  });
  const token = orders[0].get('token_address');

  const keys = [];
  await scanAsync(0, `${token}*`, keys);
  const redisOrders = await Promise.all(keys.map(key => redisClient.get(key)));
  const redisOrdersSorted = redisOrders
    .map(JSON.parse)
    .sort((a, b) => new Date(a.completed_at) - new Date(b.completed_at));

  logger.log('debug', redisOrdersSorted);

  const lowPrice = getLow(redisOrdersSorted);
  const highPrice = getHigh(redisOrdersSorted);
  const change24Hour = getChange(redisOrdersSorted);
  const volume = getVolume(redisOrdersSorted);
  const ethVolume = getEthVolume(redisOrdersSorted);
  const lastPrice = getLastPrice(redisOrdersSorted);

  logger.log('info', 'Low, High and Last prices %d %d %d', lowPrice, highPrice, lastPrice);
  logger.log('info', 'Change in 24 hour %d', change24Hour);
  logger.log('info', 'Volume %d', volume);
  logger.log('info', 'Eth Volume %d', ethVolume);

  socket.io.emit('new_message', {
    tradingInfo: {
      lowPrice,
      highPrice,
      change24Hour,
      volume,
      lastPrice,
      ethVolume,
    },
    token
  });

  redisClient.set(
    `trading:${token}`,
    JSON.stringify({
      lowPrice,
      highPrice,
      change24Hour,
      volume,
      ethVolume,
      lastPrice,
    }),
    'EX',
    60 * 60 * 24,
  );
};

export const getTradingInfo = async (token) => {
  const keys = [];
  await scanAsync(0, `trading:${token}`, keys);

  const redisTradingPromises = keys.map(key => redisClient.get(key));
  const trading = await Promise.all(redisTradingPromises);
  const tradingInfo = trading[0] || '{}';
  return JSON.parse(tradingInfo);
};

// Recursive SCAN for getting all redis keys

export const scanAsync = (cursor, pattern, returnArr) =>
  redisClient.scan(cursor, 'MATCH', pattern, 'COUNT', '100').then((reply) => {
    const cursor = reply[0];
    const keys = reply[1];
    keys.forEach((key) => {
      returnArr.push(key);
    });

    if (cursor === '0') {
      return returnArr;
    }
    return scanAsync(cursor, pattern, returnArr);
  });
