
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
    s => s.ui.currentAssetPairId,
  ],
  (
    assets,
    assetPairs,
    currentAssetPairId,
  ) => {
    const pair = assetPairs[currentAssetPairId];
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
    } : null;
  },
);
