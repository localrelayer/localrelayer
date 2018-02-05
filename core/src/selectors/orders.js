// @flow
import {
  createSelector,
} from 'reselect';

import {
  getResourceMap,
  getResourceMappedList,
} from './resources';


export const getBuyOrders = createSelector(
  getResourceMappedList('orders', 'currentOrders'),
  orders =>
    orders.filter(
      order =>
        !order.completed_at && order.action === 'buy',
    ),
);

export const getSellOrders = createSelector(
  getResourceMappedList('orders', 'currentOrders'),
  orders =>
    orders.filter(
      order =>
        !order.completed_at && order.action === 'sell',
    ),
);

export const getCompletedOrders = createSelector(
  getResourceMappedList('orders', 'currentOrders'),
  orders =>
    orders.filter(order => order.completed_at),
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

