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
  getOrderBook({
    baseAssetData = '0xe41d2489571d322189246dafa5ebde1f4699f498', /* ZRX */
    quoteAssetData = '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2', /* WETH */
  }) {
    return new Promise(r => r(
      coreMocks.mocksOrdersFactory({
        assetDataA: baseAssetData,
        assetDataB: quoteAssetData,
      }).getOrderBook({
        baseAssetData,
        quoteAssetData,
      }),
    ));
  },
});
