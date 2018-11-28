// @flow
import {
  createSelector,
} from 'reselect';

import {
  getResourceMappedList,
} from './resources';

export const getTradingHistory = createSelector(
  [
    getResourceMappedList('orders', 'tradingHistory'),
  ],
  orders => (
    orders.map(order => ({
      ...order,
      key: order.id,
      completedAt: order.metaData.completedAt,
    }))
  ),
);

export const getBidOrders = createSelector(
  [
    getResourceMappedList('orders', 'bids'),
  ],
  orders => orders.filter(o => o.metaData.isValid),
);

export const getAskOrders = createSelector(
  [
    getResourceMappedList('orders', 'asks'),
  ],
  orders => orders.filter(o => o.metaData.isValid),
);
