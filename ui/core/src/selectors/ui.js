import { createSelector } from 'reselect';
import { getProfileState } from './profile';

export const getUiState = key => state => state.ui[key];
export const isTransactionPending = createSelector(
  [getUiState('txHash'), getProfileState('pendingTransactions')],
  (hash, pendingTransactions) => pendingTransactions.find(t => t.txHash === hash),
);
