import {
  BigNumber,
} from '0x.js';
import {
  createSelector,
} from 'reselect';

import {
  coreSelectors as cs,
  utils,
} from 'instex-core';
import {
  getUiState,
} from './ui';
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


export const getOpenOrders = createSelector(
  [
    cs.getResourceMappedList('orders', 'userOrders'),
    getUiState('currentAssetPairId'),
    cs.getResourceMap('assets'),
  ],
  (
    orders,
    currentAssetPairId,
    assets,
  ) => (
    orders.map(order => ({
      ...order,
      pair: `${assets[order.makerAssetData].symbol}/${assets[order.takerAssetData].symbol}`,
      amount: utils.toUnitAmount(
        order.makerAssetAmount,
        assets[order.makerAssetData].decimals,
      ).toFixed(8),
      total: utils.toUnitAmount(
        order.takerAssetAmount,
        assets[order.takerAssetData].decimals,
      ).toFixed(8),
      price: (
        new BigNumber(order.takerAssetAmount).div(order.makerAssetAmount)
      ).toFixed(8),
      action: (
        (currentAssetPairId || '_').split('_')[0] === order.makerAssetData
          ? 'Sell'
          : 'Buy'
      ),
    }))
  ),
);
