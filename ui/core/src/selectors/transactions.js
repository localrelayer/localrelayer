import {
  createSelector,
} from 'reselect';

import {
  getResourceMap,
} from './resources';
import {
  getWalletState,
} from './wallet';
import {
  WETH_DATA_NETWORKS_MAP,
} from '../utils';


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

export const getPendingTransactionsRelativeState = createSelector(
  [
    getPendingTransactions,
    getWalletState('selectedAccount'),
    getWalletState('networkId'),
  ],
  (
    pendingTransactions,
    selectedAccount,
    networkId,
  ) => (
    pendingTransactions.reduce(
      (acc, tr) => {
        switch (tr.name) {
          case 'Allowance': {
            acc.allowance[tr.meta.asset.data] = true;
            return acc;
          }
          case 'Withdraw':
          case 'Deposit': {
            acc.balance[WETH_DATA_NETWORKS_MAP[networkId]] = true;
            return acc;
          }
          case 'Fill': {
            if (tr.address === selectedAccount) {
              acc.balance[tr.meta.makerAssetData] = true;
              acc.balance[tr.meta.takerAssetData] = true;
            }
            return acc;
          }
          case 'Cancel Order': {
            acc.cancel[tr.meta.orderHash] = true;
            return acc;
          }
          default: {
            return acc;
          }
        }
      },
      {
        allowance: {},
        balance: {},
        cancel: {},
      },
    )
  ),
);
