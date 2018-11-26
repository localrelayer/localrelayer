import {
  BigNumber,
} from '0x.js';
import {
  Web3Wrapper,
} from '@0x/web3-wrapper';
import {
  createSelector,
} from 'reselect';

import {
  coreSelectors as cs,
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
      amount: Web3Wrapper.toUnitAmount(
        new BigNumber(order.makerAssetAmount), assets[order.makerAssetData].decimals,
      ).toFixed(6),
      total: Web3Wrapper.toUnitAmount(
        new BigNumber(order.takerAssetAmount), assets[order.takerAssetData].decimals,
      ).toFixed(6),
      price: (
        new BigNumber(order.takerAssetAmount).div(order.makerAssetAmount)
      ).toFixed(6),
      action: (
        (currentAssetPairId || '_').split('_')[0] === order.makerAssetData
          ? 'Sell'
          : 'Buy'
      ),
    }))
  ),
);
