import {
  api,
  coreMocks,
} from 'instex-core';

import config from 'web-config';

api.setApiUrl(config.apiUrl);
api.setMockMethods({
  getAssetPairs(args) {
    return new Promise(r => r(
      coreMocks.getAssetPairs(args.queryParameters),
    ));
  },
  getOrderBook({ queryParameters }) {
    const {
      baseAssetData = '0xf47261b0000000000000000000000000e41d2489571d322189246dafa5ebde1f4699f498', /* ZRX */
      quoteAssetData = '0xf47261b0000000000000000000000000c02aaa39b223fe8d0a0e5c4f27ead9083c756cc2', /* WETH */
      networkId = 1,
    } = queryParameters;
    return new Promise(r => r(
      coreMocks.mocksOrdersFactory({
        networkId,
        assetDataA: baseAssetData,
        assetDataB: quoteAssetData,
      }).getOrderBook({
        networkId,
        baseAssetData,
        quoteAssetData,
      }),
    ));
  },
  getTradingHistory({ queryParameters }) {
    const {
      baseAssetData = '0xf47261b0000000000000000000000000e41d2489571d322189246dafa5ebde1f4699f498', /* ZRX */
      quoteAssetData = '0xf47261b0000000000000000000000000c02aaa39b223fe8d0a0e5c4f27ead9083c756cc2', /* WETH */
      networkId = 1,
    } = queryParameters;
    return new Promise(r => r(
      coreMocks.mocksOrdersFactory({
        networkId,
        assetDataA: baseAssetData,
        assetDataB: quoteAssetData,
      }).getTradingHistory({
        networkId,
        baseAssetData,
        quoteAssetData,
      }),
    ));
  },
  getBars(args) {
    const {
      queryParameters: {
        baseAssetData = '0xf47261b0000000000000000000000000e41d2489571d322189246dafa5ebde1f4699f498', /* ZRX */
        quoteAssetData = '0xf47261b0000000000000000000000000c02aaa39b223fe8d0a0e5c4f27ead9083c756cc2', /* WETH */
        from,
        to,
        resolution,
        firstDataRequest,
      },
    } = args;
    return new Promise(r => r(
      coreMocks.mocksOrdersFactory({
        assetDataA: baseAssetData,
        assetDataB: quoteAssetData,
        qty: {
          bids: 100,
          asks: 100,
        },
      }).getBars({
        from,
        to,
        resolution,
        firstDataRequest,
      }),
    ));
  },
});
