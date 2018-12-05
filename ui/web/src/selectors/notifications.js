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
      description: transactions[transaction].name,
      id: transaction,
      color,
      status: transactions[transaction].status,
      statusDescription,
      createdAt: transactions[transaction].createdAt,
      metaData: transactions[transaction].meta,
    };
  }),
);
