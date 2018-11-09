// @flow
import {
  createSelector,
} from 'reselect';
import {
  getResourceMappedList,
  getResourceMap,
} from './resources';
import BigNumber from '../../BigNumber';

export const getTokensInfoMock = createSelector(
  [
    getResourceMappedList('orders', 'asks'),
    getResourceMap('assets'),
  ],
  (orders, assets) => (
    orders.map(order => ({
      ...order,
      price: BigNumber(order.takerAssetAmount).div(order.makerAssetAmount).toFixed(8),
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

export const getOpenOrders = createSelector(
  [
    getResourceMappedList('orders', 'asks'),
    getResourceMap('assets'),
  ],
  (orders, assets) => (
    orders.map(order => ({
      ...order,
      price: BigNumber(order.takerAssetAmount).div(order.makerAssetAmount).toFixed(8),
      amount: order.makerAssetAmount,
      total: order.takerAssetAmount,
      key: order.id,
      date: new Date().toLocaleDateString('en-US'),
      status: 'Done',
      action: 'Buy',
      pair: `${assets[order.makerAssetData].symbol}/${assets[order.takerAssetData].symbol}`,
    }))
  ),
);

export const getTradingHistory = createSelector(
  [
    getResourceMappedList('orders', 'tradingHistory'),
  ],
  orders => (
    orders.map(order => ({
      ...order,
      price: BigNumber(order.takerAssetAmount).div(order.makerAssetAmount).toFixed(8),
      amount: order.makerAssetAmount,
      total: order.takerAssetAmount,
      key: order.id,
      date: order.completedAt,
    }))
  ),
);

export const getBidOrders = createSelector(
  [
    getResourceMappedList('orders', 'bids'),
  ],
  orders => (
    orders.map(order => ({
      ...order,
      price: BigNumber(order.takerAssetAmount).div(order.makerAssetAmount).toFixed(8),
      amount: order.makerAssetAmount,
      total: order.takerAssetAmount,
    }))
  ),
);

export const getAskOrders = createSelector(
  [
    getResourceMappedList('orders', 'asks'),
  ],
  orders => (
    orders.map(order => ({
      ...order,
      price: BigNumber(order.takerAssetAmount).div(order.makerAssetAmount).toFixed(8),
      amount: order.makerAssetAmount,
      total: order.takerAssetAmount,
    }))
  ),
);
