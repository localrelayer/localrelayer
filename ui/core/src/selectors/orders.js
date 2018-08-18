// @flow
import {
  createSelector,
} from 'reselect';
import {
  getFormValues,
} from 'redux-form';
import BigNumber from '../utils/BigNumber';
import {
  getResourceMap,
  getResourceMappedList,
} from './resources';


const getProfileState = key => ({ profile }) => profile[key];
const getUiState = key => ({ ui }) => ui[key];

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
      price: order.price,
      amount: order.amount,
      total: order.total,
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
      price: order.price,
      amount: order.amount,
      total: order.total,
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
      price: order.price,
      amount: order.amount,
      total: order.total,
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
      price: order.price,
      amount: order.amount,
      total: order.total,
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
      price: order.price,
      amount: order.amount,
      total: order.total,
      tokenSymbol: tokens[order.token_address] ? tokens[order.token_address].attributes.symbol : '',
      pairSymbol: tokens[order.pair_address] ? tokens[order.pair_address].attributes.symbol : '',
    })),
);

export const getTotal = createSelector(
  [
    getUiState('activeTab'),
    getFormValues('BuySellForm'),
    getSellOrders,
    getBuyOrders,
  ],
  (orderType, formValues = {}, sellOrders, buyOrders) => {
    const { amount = 0, price = 0 } = formValues;
    if (orderType === 'sell') {
      const total = buyOrders.reduce((acc, order) => {
        if (BigNumber(order.price).gte(+price)) {
          const requiredAmount = BigNumber(order.amount).lte(+amount) ? order.amount : BigNumber(order.amount).minus(+amount);
          return acc.add(BigNumber(requiredAmount).times(order.price));
        }
        return acc;
      }, BigNumber(0));
      return total.toFixed(6).toString();
    }
    const total = sellOrders.reduce((acc, order) => {
      if (BigNumber(order.price).lte(+price)) {
        const requiredAmount = BigNumber(order.amount).lte(+amount) ? order.amount : BigNumber(order.amount).minus(+amount);
        return acc.add(BigNumber(requiredAmount).times(order.price));
      }
      return acc;
    }, BigNumber(0));
    return total.toFixed(6).toString();
  },
);

