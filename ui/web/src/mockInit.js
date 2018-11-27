import {
  api,
  coreMocks,
} from 'instex-core';

import config from 'web-config';

const mocks = {};

api.setApiUrl(config.apiUrl);
api.setMockMethods({
  getAssetPairs(args) {
    return new Promise(r => r(
      coreMocks.getAssetPairs(args.queryParameters),
    ));
  },
  getOrderBook({ queryParameters }) {
    const {
      baseAssetData,
      quoteAssetData,
      networkId,
    } = queryParameters;
    if (!mocks[`${networkId}_${baseAssetData}_${quoteAssetData}`]) {
      mocks[`${networkId}_${baseAssetData}_${quoteAssetData}`] = coreMocks.mocksOrdersFactory({
        networkId,
        assetDataA: baseAssetData,
        assetDataB: quoteAssetData,
      });
    }
    return new Promise(r => r(
      mocks[`${networkId}_${baseAssetData}_${quoteAssetData}`].getOrderBook({
        networkId,
        baseAssetData,
        quoteAssetData,
      }),
    ));
  },
  getTradingHistory({ queryParameters }) {
    const {
      baseAssetData,
      quoteAssetData,
      networkId,
    } = queryParameters;
    if (!mocks[`${networkId}_${baseAssetData}_${quoteAssetData}`]) {
      mocks[`${networkId}_${baseAssetData}_${quoteAssetData}`] = coreMocks.mocksOrdersFactory({
        networkId,
        assetDataA: baseAssetData,
        assetDataB: quoteAssetData,
      });
    }
    return new Promise(r => r(
      mocks[`${networkId}_${baseAssetData}_${quoteAssetData}`].getTradingHistory({
        networkId,
        baseAssetData,
        quoteAssetData,
      }),
    ));
  },
  getBars(args) {
    const {
      queryParameters: {
        networkId,
        baseAssetData,
        quoteAssetData,
        from,
        to,
        resolution,
        firstDataRequest,
      },
    } = args;
    if (!mocks[`${networkId}_${baseAssetData}_${quoteAssetData}`]) {
      mocks[`${networkId}_${baseAssetData}_${quoteAssetData}`] = coreMocks.mocksOrdersFactory({
        networkId,
        assetDataA: baseAssetData,
        assetDataB: quoteAssetData,
      });
    }
    return new Promise(r => r(
      mocks[`${networkId}_${baseAssetData}_${quoteAssetData}`].getBars({
        networkId,
        from,
        to,
        resolution,
        firstDataRequest,
      }),
    ));
  },
});
