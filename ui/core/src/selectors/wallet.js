import {
  createSelector,
} from 'reselect';
import {
  toUnitAmount,
} from '../utils';


export const getWalletState = (
  key => (
    ({ wallet }) => (
      wallet[key]
    )
  )
);

export const getEthWalletBalance = createSelector(
  getWalletState('selectedAccountBalance'),
  balance => (
    toUnitAmount(balance, 18).toFixed(8)
  ),
);
