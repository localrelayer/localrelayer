import {
  coreMocks,
} from 'localrelayer-core';

const baseAssetData = '0xf47261b0000000000000000000000000e41d2489571d322189246dafa5ebde1f4699f498'; /* ZRX */
const quoteAssetData = '0xf47261b0000000000000000000000000c02aaa39b223fe8d0a0e5c4f27ead9083c756cc2'; /* WETH */


test('getTradingHistory: filter makerAssetData and takerAssetData fields', () => {
  const orders = coreMocks.mocksOrdersFactory({
    assetDataA: baseAssetData,
    assetDataB: quoteAssetData,
  }).getTradingHistory({
    baseAssetData,
    quoteAssetData,
  });

  expect(
    orders.records
      .every(
        record => (
          [baseAssetData, quoteAssetData].includes(record.order.makerAssetData)
          && [baseAssetData, quoteAssetData].includes(record.order.takerAssetData)
          && record.metaData.completedAt
        ),
      ),
  ).toBe(true);
});
