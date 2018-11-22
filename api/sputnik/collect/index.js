import {
  coRedisClient,
} from 'redisClient';

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

  const makerTaker = {
    pair: `${makerAssetData}_${takerAssetData}`,
    data: await coRedisClient.get([
      makerAssetData,
      takerAssetData,
      networkId,
      'tradingInfo',
    ].join('_')),
  };

  const takerMaker = {
    pair: `${takerAssetData}_${makerAssetData}`,
    data: await coRedisClient.get([
      takerAssetData,
      makerAssetData,
      networkId,
      'tradingInfo',
    ].join('_')),
  };

  const tradingInfoRedisKeyMakerTaker = `${makerTaker.pair}_${networkId}_tradingInfo`;
  const tradingInfoRedisKeyTakerMaker = `${takerMaker.pair}_${networkId}_tradingInfo`;

  logger.info('Previous data Maker/Taker', makerTaker.data ? JSON.parse(makerTaker.data) : makerTaker.data);
  logger.info('Previous data Taker/Maker', takerMaker.data ? JSON.parse(takerMaker.data) : takerMaker.data);

  const tradingInfoMakerTaker = calculateTradingInfo({
    assetAAmount: makerAssetAmount,
    assetBAmount: takerAssetAmount,
    currentTradingInfo: makerTaker.data ? JSON.parse(makerTaker.data) : undefined,
  });

  const tradingInfoTakerMaker = calculateTradingInfo({
    assetAAmount: takerAssetAmount,
    assetBAmount: makerAssetAmount,
    currentTradingInfo: takerMaker.data ? JSON.parse(takerMaker.data) : undefined,
  });

  await coRedisClient.set(
    tradingInfoRedisKeyMakerTaker,
    JSON.stringify({
      ...tradingInfoMakerTaker,
      id: makerTaker.pair,
      networkId,
      assetDataA: makerAssetData,
      assetDataB: takerAssetData,
    }),
    'EX',
    60 * 60 * 24,
  );

  await coRedisClient.set(
    tradingInfoRedisKeyTakerMaker,
    JSON.stringify({
      ...tradingInfoTakerMaker,
      id: takerMaker.pair,
      networkId,
      assetDataA: takerAssetData,
      assetDataB: makerAssetData,
    }),
    'EX',
    60 * 60 * 24,
  );

  return {
    tradingInfoMakerTaker,
    tradingInfoTakerMaker,
    tradingInfoRedisKeyMakerTaker,
    tradingInfoRedisKeyTakerMaker,
  };
}
