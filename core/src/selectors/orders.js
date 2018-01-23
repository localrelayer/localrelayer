// @flow
import {
  createSelector,
} from 'reselect';

import {
  getOrders,
  getTokensMap,
} from './resources';


export const getBuyOrders = createSelector(
  getOrders,
  orders =>
    orders.filter(
      order =>
        !order.completed_at && order.action === 'buy',
    ),
);

export const getSellOrders = createSelector(
  getOrders,
  orders =>
    orders.filter(
      order =>
        !order.completed_at && order.action === 'sell',
    ),
);

export const getCompletedOrders = createSelector(
  getOrders,
  orders =>
    orders.filter(order => order.completed_at),
);

export const geUserOrders = createSelector(
  [
    getOrders,
    getTokensMap,
  ],
  (orders, tokensMap) =>
    orders.map(order =>
      ({
        ...order,
        tokenSymbol: tokensMap[order.token_id].attributes.symbol,
      })),
);

export const getUserOrders = createSelector(
  [
    getOrders,
    getTokensMap,
  ],
  (
    orders,
    tokensMap,
  ) =>
    orders.map(order =>
      ({
        ...order,
        tokenSymbol: tokensMap[order.token_id].attributes.symbol,
      })),
);

