import {
  api,
  coreMocks,
} from 'instex-core';

import config from 'web-config';

const mocks = {};
const memoizeMocks = ({
  networkId,
  baseAssetData,
  quoteAssetData,
  additionalKey = '',
}) => {
  if (!mocks[`${networkId}_${baseAssetData}_${quoteAssetData}_${additionalKey}`]) {
    mocks[`${networkId}_${baseAssetData}_${quoteAssetData}`] = coreMocks.mocksOrdersFactory({
      networkId,
      assetDataA: baseAssetData,
      assetDataB: quoteAssetData,
    });
  }
};

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
    memoizeMocks({
      networkId,
      baseAssetData,
      quoteAssetData,
    });
    return new Promise(r => r(
      mocks[`${networkId}_${baseAssetData}_${quoteAssetData}`]
        .getOrderBook({
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
    memoizeMocks({
      networkId,
      baseAssetData,
      quoteAssetData,
      additionalKey: 'tradingHistory',
    });
    return new Promise(r => r(
      mocks[`${networkId}_${baseAssetData}_${quoteAssetData}`]
        .getTradingHistory({
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
    memoizeMocks({
      networkId,
      baseAssetData,
      quoteAssetData,
    });
    return new Promise(r => r(
      mocks[`${networkId}_${baseAssetData}_${quoteAssetData}`]
        .getBars({
          networkId,
          from,
          to,
          resolution,
          firstDataRequest,
        }),
    ));
  },
  getTradingInfo({ bodyParameters }) {
    const {
      networkId,
      assetDataA: baseAssetData,
      assetDataB: quoteAssetData,
    } = bodyParameters.pairs[0];
    memoizeMocks({
      networkId,
      baseAssetData,
      quoteAssetData,
    });
    return new Promise(r => r(
      mocks[`${networkId}_${baseAssetData}_${quoteAssetData}`]
        .getTradingInfo({
          networkId,
          baseAssetData,
          quoteAssetData,
        }),
    ));
  },
});
