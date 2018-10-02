// @flow
import {
  createSelector,
} from 'reselect';
import BigNumber from 'bignumber.js';
import {
  getResourceMappedList,
  getResourceMap,
} from './resources';


export const getOpenOrders = createSelector(
  [
    getResourceMappedList('orders', 'asks'),
    getResourceMap('assets'),
  ],
  (orders, assets) => (
    orders.map(order => ({
      ...order,
      price: (
        BigNumber(order.takerAssetAmount)
        / BigNumber(order.makerAssetAmount)
      ).toFixed(8),
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

export const getOrdersHistoryMock = createSelector(
  [
    getResourceMappedList('orders', 'asks'),
  ],
  orders => (
    orders.map(order => ({
      ...order,
      price: (
        BigNumber(order.takerAssetAmount)
        / BigNumber(order.makerAssetAmount)
      ).toFixed(8),
      amount: order.makerAssetAmount,
      total: order.takerAssetAmount,
      key: order.id,
      date: new Date().toLocaleDateString('en-US'),
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
      price: (
        BigNumber(order.takerAssetAmount)
        / BigNumber(order.makerAssetAmount)
      ).toFixed(8),
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
      price: (
        BigNumber(order.takerAssetAmount)
        / BigNumber(order.makerAssetAmount)
      ).toFixed(8),
      amount: order.makerAssetAmount,
      total: order.takerAssetAmount,
    }))
  ),
);
