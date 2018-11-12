import {
  createSelector,
} from 'reselect';
import BigNumber from '../utils/BigNumber';
import {
  getUserOrders,
} from './orders';

export const getProfileState = key => ({ profile }) => profile[key];

export const getLockedPairBalance = createSelector([getUserOrders],
  (orders) => {
    const lockedPair = orders
      .filter(order => order.type === 'buy')
      .reduce((acc, order) => BigNumber(acc).add(order.total), 0);
    return lockedPair;
  });

export const getLockedTokenBalance = token => createSelector([getUserOrders],
  (orders) => {
    const lockedToken = orders
      .filter(order => order.token_address === token.id && order.type === 'sell')
      .reduce((acc, order) => BigNumber(acc).add(order.amount), 0);
    return lockedToken;
  });
