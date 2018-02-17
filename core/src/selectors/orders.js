// @flow
import {
  createSelector,
} from 'reselect';
import BigNumber from 'bignumber.js';
import {
  getResourceMap,
  getResourceMappedList,
} from './resources';

export const getBuyOrders = createSelector(
  getResourceMappedList('orders', 'buy'),
  orders => orders.filter(order => !order.canceled_at).map(order => ({
    ...order,
    price: BigNumber(order.price).toFixed(4),
    amount: BigNumber(order.amount).toFixed(4),
    total: BigNumber(order.total).toFixed(4),
  })),
);

export const getSellOrders = createSelector(
  getResourceMappedList('orders', 'sell'),
  orders => orders.filter(order => !order.canceled_at).map(order => ({
    ...order,
    price: BigNumber(order.price).toFixed(4),
    amount: BigNumber(order.amount).toFixed(4),
    total: BigNumber(order.total).toFixed(4),
  })),
);

export const getCompletedOrders = createSelector(
  getResourceMappedList('orders', 'completedOrders'),
  orders => orders.filter(order => !order.canceled_at).map(order => ({
    ...order,
    price: BigNumber(order.price).toFixed(4),
    amount: BigNumber(order.amount).toFixed(4),
    total: BigNumber(order.total).toFixed(4),
  })),
);

export const getUserOrders = createSelector(
  [
    getResourceMappedList('orders', 'userOrders'),
    getResourceMap('tokens'),
  ],
  (orders, tokens) => orders.filter(order => !order.canceled_at).map(order => ({
    ...order,
    price: BigNumber(order.price).toFixed(4),
    amount: BigNumber(order.amount).toFixed(4),
    total: BigNumber(order.total).toFixed(4),
    tokenSymbol: tokens[order.token_address] ? tokens[order.token_address].attributes.symbol : '',
  })),
);

