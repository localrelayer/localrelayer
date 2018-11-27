// @flow
import {
  BigNumber,
} from '0x.js';
import {
  createSelector,
} from 'reselect';

import {
  utils,
} from 'instex-core';
import {
  getResourceMappedList,
  getResourceMap,
} from './resources';


export const getTokensInfoMock = createSelector(
  [
    getResourceMappedList('orders', 'asks'),
    getResourceMap('assets'),
  ],
  (orders, assets) => (
    orders.map(order => ({
      ...order,
      price: (
        new BigNumber(order.takerAssetAmount).div(order.makerAssetAmount)
      ).toFixed(8),
      amount: order.makerAssetAmount,
      total: order.takerAssetAmount,
      key: order.id,
      coin: `${assets[order.makerAssetData].symbol}`,
      change: 0.01,
      volume: 0.03,
      volumeEth: 320.333,
    }))
  ),
);

export const getTradingHistory = createSelector(
  [
    getResourceMappedList('orders', 'tradingHistory'),
    getResourceMap('assets'),
  ],
  (orders, assets) => (
    orders.map(order => ({
      ...order,
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
      key: order.id,
      completedAt: order.metaData.completedAt,
    }))
  ),
);

export const getBidOrders = createSelector(
  [
    getResourceMappedList('orders', 'bids'),
    getResourceMap('assets'),
  ],
  (orders, assets) => (
    orders.filter(o => o.metaData.isValid).map(order => ({
      ...order,
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
    }))
  ),
);

export const getAskOrders = createSelector(
  [
    getResourceMappedList('orders', 'asks'),
    getResourceMap('assets'),
  ],
  (orders, assets) => (
    orders.filter(o => o.metaData.isValid).map(order => ({
      ...order,
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
    }))
  ),
);
