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

export const getType = (assetA, makerAssetData) => assetA === makerAssetData;

export const getPrice = (type, makerAssetAmount, takerAssetAmount) => (
  type === 'bid'
    ? new BigNumber(takerAssetAmount).div(makerAssetAmount)
    : new BigNumber(makerAssetAmount).div(takerAssetAmount));

export const getCurrentOrder = createSelector(
  [
    getUiState('currentAssetPairId'),
    getUiState('currentOrderId'),
    cs.getResourceMap('assets'),
    cs.getResourceMap('orders'),
  ],
  (
    currentAssetPairId,
    currentOrderId,
    assets,
    orders,
  ) => (currentOrderId
    ? {
      amount: utils.toUnitAmount(
        orders[currentOrderId].makerAssetAmount,
        assets[orders[currentOrderId].makerAssetData].decimals,
      ).toFixed(8),
      price: getPrice(
        getType(currentAssetPairId.split('_')[0], orders[currentOrderId].makerAssetData),
        orders[currentOrderId].makerAssetAmount,
        orders[currentOrderId].takerAssetAmount,
      ),
    } : {}),
);
