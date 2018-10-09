import {
  createSelector,
} from 'reselect';

import {
  coreSelectors as cs,
} from 'instex-core';


export const getCurrentAssetPair = createSelector(
  [
    cs.getResourceMap('assets'),
    cs.getResourceMap('assetPairs'),
    cs.getResourceMap('tradingInfo'),
    s => s.ui.currentAssetPairId,
  ],
  (
    assets,
    assetPairs,
    tradingInfo,
    currentPairId,
  ) => {
    const pair = assetPairs[currentPairId];
    const pairTradingInfo = tradingInfo[currentPairId];
    return pair ? {
      ...pair,
      assetDataA: {
        ...pair.assetDataA,
        assetData: assets[pair.assetDataA.assetData],
      },
      assetDataB: {
        ...pair.assetDataB,
        assetData: assets[pair.assetDataB.assetData],
      },
      tradingInfo: pairTradingInfo,
    } : null;
  },
);
