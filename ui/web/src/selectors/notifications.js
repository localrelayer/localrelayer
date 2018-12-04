import {
  createSelector,
} from 'reselect';
import {
  coreSelectors as cs,
} from 'instex-core';


export const getNotifications = createSelector(
  [
    cs.getWalletState('selectedAccount'),
    cs.getResourceMap('transactions'),
    s => s.transactions.lists,
  ],
  (
    selectedAccount,
    transactions,
    lists,
  ) => (
    (lists[selectedAccount] || []).map(transaction => ({
      color: 'green',
      description: 'Allowence',
      id: transaction,
    }))
  ),
);
