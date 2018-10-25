import {
  createSelector,
} from 'reselect';
import {
  getWalletState,
} from 'instex-core/selectors';
import {
  Web3Wrapper,
} from '@0xproject/web3-wrapper';
import {
  BigNumber,
} from '0x.js';

export const getFormattedWalletBalance = createSelector(
  [getWalletState('selectedAccountBalance')],
  balance => Web3Wrapper.toUnitAmount(new BigNumber(balance), 18).toFixed(8),
);
