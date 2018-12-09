import {
  createSelector,
} from 'reselect';

import {
  getResourceMap,
} from './resources';
import {
  getWalletState,
} from './wallet';


const sorter = (a, b) => {
  if (a.completedAt && b.completedAt) {
    return new Date(b.completedAt) - new Date(a.completedAt);
  }
  if (!a.completedAt && b.completedAt) {
    return -1;
  } if (a.completedAt && !b.completedAt) {
    return 1;
  }
  return new Date(b.createdAt) - new Date(a.createdAt);
};

export const getTransactions = createSelector(
  [
    getWalletState('selectedAccount'),
    getResourceMap('transactions'),
    s => s.transactions.lists,
  ],
  (
    selectedAccount,
    transactions,
    lists,
  ) => (lists[selectedAccount] || []).map((id) => {
    let statusDescription;
    let color;
    if (Number.isInteger(transactions[id].status)) {
      statusDescription = transactions[id].status === 1
        ? 'Done'
        : 'Failed';
      color = transactions[id].status === 1
        ? 'green'
        : 'red';
    } else {
      statusDescription = 'Pending';
      color = 'yellow';
    }
    return {
      color,
      statusDescription,
      ...transactions[id],
    };
  }).sort(sorter),
);

export const getPendingTransactions = createSelector(
  [
    getWalletState('selectedAccount'),
    getResourceMap('transactions'),
    s => s.transactions.lists,
  ],
  (
    selectedAccount,
    transactions,
    lists,
  ) => (
    (lists[selectedAccount] || [])
      .map(
        id => (
          Number.isInteger(transactions[id].status)
            ? false
            : transactions[id]
        ),
      ).filter(Boolean)
  ),
);
