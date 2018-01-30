import {
  createSelector,
} from 'reselect';

export const getAddress = ({ profile }) => profile.address;
export const getBalance = ({ profile }) => profile.balance;
export const getUserTokens = ({ profile }) => profile.tokens;
export const getConnectionStatus = ({ profile }) => profile.connectionStatus;

export const getUserTokenBy = (field, value) =>
  createSelector(
    getUserTokens,
    userTokens => userTokens.find(
      t => t[field] === value,
    ) || {},
  );
