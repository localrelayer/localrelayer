import {
  createSelector,
} from 'reselect';
import {
  getUserOrders,
} from './orders';
import {
  getCurrentToken,
} from './tokens';

export const getProfileState = key => ({ profile }) => profile[key];

export function getAddress({ profile }) {
  return profile.address;
}
export const getBalance = ({ profile }) => profile.balance;
export const getUserTokens = ({ profile }) => profile.tokens;
export const getConnectionStatus = ({ profile }) => profile.connectionStatus;

export const getUserTokenBy = (field, value) =>
  createSelector(getUserTokens,
    userTokens => userTokens.find(t => t[field] === value) || {});

export const getLockedBalances = createSelector(
  [getCurrentToken, getUserOrders],
  (token, orders) => {
    const lockedToken = orders
      .filter(order => order.token_address === token.id && order.type === 'sell')
      .reduce((acc, order) => acc + +order.amount, 0);
    const lockedPair = orders
      .filter(order => order.type === 'buy')
      .reduce((acc, order) => acc + +order.total, 0);
    return { lockedToken, lockedPair };
  },
);
