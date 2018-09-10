import {
  assetDataUtils,
} from '0x.js';

import redisClient from '../redis';
import {
  calculateTradingInfo,
} from '../process';
import {
  Order,
} from '../db';


export async function collectOrder(data) {
  const order = new Order(data);
  const savedOrder = await order.save();
  return savedOrder;
}

export async function collectTradingInfo(order) {
  const assetA = assetDataUtils.decodeAssetDataOrThrow(order.makerAssetData);
  const assetB = assetDataUtils.decodeAssetDataOrThrow(order.takerAssetData);
  const {
    makerAssetAmount,
    takerAssetAmount,
  } = order;

  // Trying to get data from both keys
  const existingPairs = [{
    pair: `${assetA.tokenAddress}_${assetB.tokenAddress}`,
    data: await redisClient.get(`${assetA.tokenAddress}_${assetB.tokenAddress}`),
  }, {
    pair: `${assetB.tokenAddress}_${assetA.tokenAddress}`,
    data: await redisClient.get(`${assetB.tokenAddress}_${assetA.tokenAddress}`),
  }];
  if (existingPairs.filter(d => d.data).length === 2) throw Error('Duplicate pair key!');

  const {
    pair,
    data,
  } = existingPairs.find(d => d.data) || {
    pair: `${assetA.tokenAddress}_${assetB.tokenAddress}`,
    data: null,
  };
  console.log('Previous data', data);

  const tradingInfo = calculateTradingInfo({
    makerAssetAmount,
    takerAssetAmount,
    currentTradingInfo: data ? JSON.parse(data) : undefined,
  });

  await redisClient.set(
    pair,
    JSON.stringify(tradingInfo),
    'EX',
    60 * 60 * 24,
  );

  return {
    pair,
    tradingInfo,
  };
}
