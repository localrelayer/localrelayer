import {
  createSelector,
} from 'reselect';
import {
  getWalletState,
} from 'instex-core/selectors';
import {
  Web3Wrapper,
} from '@0x/web3-wrapper';
import {
  BigNumber,
} from '0x.js';

export const getFormattedWalletBalance = createSelector(
  getWalletState('selectedAccountBalance'),
  balance => Web3Wrapper.toUnitAmount(new BigNumber(balance), 18).toFixed(8),
);

export const getWalletBalance = createSelector(
  [getWalletState('balance')],
  balance => (
    Object.keys(balance).reduce((acc, curr) => {
      acc[curr] = Web3Wrapper.toUnitAmount(new BigNumber(balance[curr]), 18).toFixed(8);
      return acc;
    }, {})
  ),
);
