import {
  createSelector,
} from 'reselect';

import {
  coreSelectors as cs,
} from 'instex-core';
import {
  assetDataUtils,
} from '0x.js';
import {
  getCurrentAssetPair,
} from '.';


export const getTradingHistory = createSelector(
  [
    cs.getTradingHistory,
    getCurrentAssetPair,
  ],
  (
    orders,
    currentAssetPair,
  ) => {
    if (!currentAssetPair) {
      return [];
    }

    const baseAsset = currentAssetPair.assetDataA.assetData.address;

    return (
      orders
        .map(
          (order) => {
            // const makerAsset = assetDataUtils.decodeAssetDataOrThrow(order.makerAssetData);
            const makerAsset = order.makerAssetData;
            return {
              ...order,
              type: makerAsset === baseAsset ? 'ask' : 'bid',
            };
          },
        )
    );
  },
);
