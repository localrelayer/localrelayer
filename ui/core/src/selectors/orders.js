// @flow
import {
  createSelector,
} from 'reselect';
import BigNumber from 'bignumber.js';
import {
  getResourceMappedList,
} from './resources';


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
