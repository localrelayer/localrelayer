import {
  createSelector,
} from 'reselect';
import {
  getUserOrders,
} from './orders';

export const getProfileState = key => ({ profile }) => profile[key];

export function getAddress({ profile }) {
  return profile.address;
}
export const getBalance = ({ profile }) => profile.balance;
export const getConnectionStatus = ({ profile }) => profile.connectionStatus;

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
