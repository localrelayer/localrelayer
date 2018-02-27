// @flow
import {
  createSelector,
} from 'reselect';
import BigNumber from 'bignumber.js';
import {
  getResourceMap,
  getResourceMappedList,
} from './resources';
import { getAddress } from './profile';

export const getBuyOrders = createSelector(
  [
    getResourceMappedList('orders', 'buy'),
    getAddress,
  ],
  (orders, address) => orders
    .filter(order =>
      !order.canceled_at &&
      !order.completed_at &&
      !order.child_id &&
      order.type === 'buy')
    .map(order => ({
      ...order,
      price: BigNumber(order.price).toFixed(6),
      amount: BigNumber(order.amount).toFixed(6),
      total: BigNumber(order.total).toFixed(6),
      isUser: address === order.maker_address,
    })),
);

export const getSellOrders = createSelector(
  [
    getResourceMappedList('orders', 'sell'),
    getAddress,
  ],
  (orders, address) => orders
    .filter(order =>
      !order.canceled_at &&
      !order.completed_at &&
      !order.child_id &&
      order.type === 'sell')
    .map(order => ({
      ...order,
      price: BigNumber(order.price).toFixed(6),
      amount: BigNumber(order.amount).toFixed(6),
      total: BigNumber(order.total).toFixed(6),
      isUser: address === order.maker_address,
    })),
);

export const getCompletedOrders = createSelector(
  [
    getResourceMappedList('orders', 'completedOrders'),
    getAddress,
  ],
  (orders, address) => orders
    .filter(order =>
      !order.canceled_at &&
      order.completed_at &&
      order.is_history)
    .map(order => ({
      ...order,
      price: BigNumber(order.price).toFixed(6),
      amount: BigNumber(order.amount).toFixed(6),
      total: BigNumber(order.total).toFixed(6),
      isUser: address === order.maker_address,
    })),
);

export const getUserOrders = createSelector(
  [
    getResourceMappedList('orders', 'userOrders'),
    getResourceMap('tokens'),
  ],
  (orders, tokens) => orders
    .filter(order =>
      !order.canceled_at &&
      !order.completed_at &&
      !order.child_id)
    .map(order => ({
      ...order,
      price: BigNumber(order.price).toFixed(6),
      amount: BigNumber(order.amount).toFixed(6),
      total: BigNumber(order.total).toFixed(6),
      tokenSymbol: tokens[order.token_address] ? tokens[order.token_address].attributes.symbol : '',
    })),
);

