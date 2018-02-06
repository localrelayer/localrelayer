// @flow
import {
  createSelector,
} from 'reselect';
import BigNumber from 'bignumber.js';
import {
  getResourceMap,
  getResourceMappedList,
} from './resources';

export const calculateTotal = (amount: string, price: string): string =>
  BigNumber(price).times(BigNumber(amount)).toFixed(4).toString();

export const getBuyOrders = createSelector(
  getResourceMappedList('orders', 'buy'),
  orders => orders.map(order => ({
    ...order,
    price: BigNumber(order.price).toFixed(4),
    amount: BigNumber(order.amount).toFixed(4),
    total: calculateTotal(order.amount, order.price),
  })),
);

export const getSellOrders = createSelector(
  getResourceMappedList('orders', 'sell'),
  orders => orders.map(order => ({
    ...order,
    price: BigNumber(order.price).toFixed(4),
    amount: BigNumber(order.amount).toFixed(4),
    total: calculateTotal(order.amount, order.price),
  })),
);

export const getCompletedOrders = createSelector(
  getResourceMappedList('orders', 'completedOrders'),
  orders => orders.map(order => ({
    ...order,
    price: BigNumber(order.price).toFixed(4),
    amount: BigNumber(order.amount).toFixed(4),
    total: calculateTotal(order.amount, order.price),
  })),
);

export const geUserOrders = createSelector(
  [
    getResourceMappedList('orders', 'currentOrders'),
    getResourceMap('tokens'),
  ],
  (orders, tokensMap) =>
    orders.map(order =>
      ({
        ...order,
        tokenSymbol: tokensMap[order.relationships.token.data.id].attributes.symbol,
      })),
);

export const getUserOrders = createSelector(
  [
    getResourceMappedList('orders', 'currentOrders'),
    getResourceMap('tokens'),
  ],
  (
    orders,
    tokensMap,
  ) =>
    orders.map(order =>
      ({
        ...order,
        tokenSymbol: tokensMap[order.relationships.token.data.id].attributes.symbol,
      })),
);

