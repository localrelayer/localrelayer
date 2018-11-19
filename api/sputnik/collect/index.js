import {
  coRedisClient,
} from 'redisClient';
import {
  Order,
} from 'db';

import {
  calculateTradingInfo,
} from '../process';


export async function collectOrder(data) {
  const order = new Order(data);
  const savedOrder = await order.save();
  return savedOrder;
}

export async function collectTradingInfo(order, logger) {
  console.log('a');
  const {
    networkId,
    makerAssetData: assetDataA,
    takerAssetData: assetDataB,
    makerAssetAmount,
    takerAssetAmount,
  } = order;

  const existingPairs = [{
    pair: `${assetDataA}_${assetDataB}`,
    data: await coRedisClient.get([
      assetDataA,
      assetDataB,
      networkId,
      'tradingInfo',
    ].join('_')),
  }, {
    pair: `${assetDataB}_${assetDataA}`,
    data: await coRedisClient.get([
      assetDataB,
      assetDataA,
      networkId,
      'tradingInfo',
    ].join('_')),
  }];
  if (existingPairs.filter(d => d.data).length === 2) {
    logger.debug(existingPairs);
    throw Error('Duplicate pair key!');
  }

  const {
    pair,
    data,
  } = existingPairs.find(d => d.data) || {
    pair: `${assetDataA}_${assetDataB}`,
    data: null,
  };
  const tradingInfoRedisKey = `${pair}_${networkId}_tradingInfo`;
  logger.info('Previous data', data ? JSON.parse(data) : data);

  const tradingInfo = calculateTradingInfo({
    makerAssetAmount,
    takerAssetAmount,
    currentTradingInfo: data ? JSON.parse(data) : undefined,
  });

  await coRedisClient.set(
    tradingInfoRedisKey,
    JSON.stringify({
      ...tradingInfo,
      id: pair,
      networkId,
      assetDataA: pair.split('_')[0],
      assetDataB: pair.split('_')[1],
    }),
    'EX',
    60 * 60 * 24,
  );

  return {
    tradingInfo,
    tradingInfoRedisKey,
  };
}
