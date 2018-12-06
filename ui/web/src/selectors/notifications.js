import {
  createSelector,
} from 'reselect';
import {
  coreSelectors as cs,
} from 'instex-core';

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
  ) => (lists[selectedAccount] || []).map((transaction) => {
    let statusDescription;
    let color;
    if (Number.isInteger(transactions[transaction].status)) {
      statusDescription = transactions[transaction].status === 1
        ? 'Done'
        : 'Failed';
      color = transactions[transaction].status === 1
        ? 'green'
        : 'red';
    } else {
      statusDescription = 'Pending';
      color = 'yellow';
    }
    return {
      id: transaction,
      color,
      statusDescription,
      ...transactions[transaction],
    };
  }).sort(sorter),
);
