import {
  createSelector,
} from 'reselect';
import {
  coreSelectors as cs,
} from 'instex-core';
import {
  Web3Wrapper,
} from '@0x/web3-wrapper';
import {
  BigNumber,
} from '0x.js';

export const getEthWalletBalance = createSelector(
  cs.getWalletState('selectedAccountBalance'),
  balance => Web3Wrapper.toUnitAmount(new BigNumber(balance), 18).toFixed(8),
);

export const getWalletBalance = createSelector(
  cs.getWalletState('balance'),
  balance => (
    Object.keys(balance).reduce((acc, curr) => {
      acc[curr] = Web3Wrapper.toUnitAmount(new BigNumber(balance[curr]), 18).toFixed(8);
      return acc;
    }, {})
  ),
);
