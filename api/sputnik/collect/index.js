import {
  coRedisClient,
} from 'redisClient';
import {
  AssetPair,
} from 'db';

import {
  calculateTradingInfo,
} from '../process';

export async function collectTradingInfo(order, logger) {
  const {
    networkId,
    makerAssetData,
    takerAssetData,
    makerAssetAmount,
    takerAssetAmount,
  } = order;

  const existingPairs = [{
    pair: `${makerAssetData}_${takerAssetData}`,
    data: await coRedisClient.get([
      makerAssetData,
      takerAssetData,
      networkId,
      'tradingInfo',
    ].join('_')),
  }, {
    pair: `${takerAssetData}_${makerAssetData}`,
    data: await coRedisClient.get([
      takerAssetData,
      makerAssetData,
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
    pair: `${makerAssetData}_${takerAssetData}`,
    data: null,
  };

  const tradingInfoRedisKey = `${pair}_${networkId}_tradingInfo`;
  logger.info('Previous data', data ? JSON.parse(data) : data);

  const askPair = await AssetPair.find({
    'assetDataA.assetData': makerAssetData,
    'assetDataB.assetData': takerAssetData,
    networkId,
  });

  const orderType = askPair.length ? 'ask' : 'bid';

  const tradingInfo = calculateTradingInfo({
    makerAssetAmount,
    takerAssetAmount,
    currentTradingInfo: data ? JSON.parse(data) : undefined,
    orderType,
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
