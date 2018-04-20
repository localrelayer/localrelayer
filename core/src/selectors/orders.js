// @flow
import {
  createSelector,
} from 'reselect';
import BigNumber from '../utils/BigNumber';
import {
  getResourceMap,
  getResourceMappedList,
} from './resources';

const getProfileState = key => ({ profile }) => profile[key];

export const getBuyOrders = createSelector(
  [
    getResourceMappedList('orders', 'buy'),
    getProfileState('address'),
  ],
  (orders, address) => orders
    .filter(order =>
      !order.canceled_at &&
      !order.completed_at &&
      !order.child_id &&
      order.status !== 'failed' &&
      order.type === 'buy')
    .map(order => ({
      ...order,
      price: BigNumber(order.price).toFixed(6),
      amount: BigNumber(order.amount).toFixed(6),
      total: BigNumber(order.total).toFixed(6),
      isUser: address === order.maker_address,
    }))
    .sort((a, b) => b.price - a.price),
);

export const getSellOrders = createSelector(
  [
    getResourceMappedList('orders', 'sell'),
    getProfileState('address'),
  ],
  (orders, address) => orders
    .filter(order =>
      !order.canceled_at &&
      !order.completed_at &&
      !order.child_id &&
      order.status !== 'failed' &&
      order.type === 'sell')
    .map(order => ({
      ...order,
      price: BigNumber(order.price).toFixed(6),
      amount: BigNumber(order.amount).toFixed(6),
      total: BigNumber(order.total).toFixed(6),
      isUser: address === order.maker_address,
    }))
    .sort((a, b) => a.price - b.price),
);

export const getCompletedOrders = createSelector(
  [
    getResourceMappedList('orders', 'completedOrders'),
    getProfileState('address'),
  ],
  (orders, address) => orders
    .filter(order =>
      !order.canceled_at &&
      order.completed_at &&
      order.status === 'completed' &&
      order.is_history)
    .map(order => ({
      ...order,
      price: BigNumber(order.price).toFixed(4),
      amount: BigNumber(order.amount).toFixed(4),
      total: BigNumber(order.total).toFixed(4),
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
      pairSymbol: tokens[order.pair_address] ? tokens[order.pair_address].attributes.symbol : '',
    })),
);

export const getCompletedUserOrders = createSelector(
  [
    getResourceMappedList('orders', 'completedUserOrders'),
    getResourceMap('tokens'),
  ],
  (orders, tokens) => orders
    .map(order => ({
      ...order,
      price: BigNumber(order.price).toFixed(6),
      amount: BigNumber(order.amount).toFixed(6),
      total: BigNumber(order.total).toFixed(6),
      tokenSymbol: tokens[order.token_address] ? tokens[order.token_address].attributes.symbol : '',
      pairSymbol: tokens[order.pair_address] ? tokens[order.pair_address].attributes.symbol : '',
    })),
);

