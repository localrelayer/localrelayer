import * as eff from 'redux-saga/effects';
import {
  Web3Wrapper,
} from '@0x/web3-wrapper';
import createActionCreators from 'redux-resource-action-creators';

import {
  getResourceById,
} from '../selectors';
import ethApi from '../ethApi';
import api from '../api';


export function* awaitTransaction(txHash) {
  const web3 = ethApi.getWeb3();
  const web3Wrapper = new Web3Wrapper(web3.currentProvider);
  const {
    status,
    blockHash,
    blockNumber,
    gasUsed,
    cumulativeGasUsed,
  } = yield eff.call(
    [
      web3Wrapper,
      web3Wrapper.awaitTransactionMinedAsync,
    ],
    txHash,
  );
  const transaction = yield eff.select(getResourceById(
    'transactions',
    txHash,
  ));
  yield eff.call(
    saveTransaction, /* eslint-disable-line */
    {
      status,
      blockHash,
      blockNumber,
      gasUsed,
      cumulativeGasUsed,
      ...transaction,
    },
    'update',
  );
}

export function* saveTransaction(
  transaction,
  action = 'create',
) {
  const actions = createActionCreators(action, {
    resourceType: 'transactions',
    requestKey: 'saveTransaction',
    list: transaction.address,
  });
  try {
    yield eff.put(actions.pending());
    yield eff.call(
      api.saveTransaction,
      transaction,
    );
    yield eff.put(actions.succeeded({
      resources: [{
        id: transaction.transactionHash,
        ...transaction,
      }],
    }));
    if (action === 'create') {
      yield eff.fork(
        awaitTransaction,
        transaction.transactionHash,
      );
    }
  } catch (err) {
    console.log(err);
    yield eff.put(actions.succeeded({
      resources: [],
    }));
  }
}

export function* fetchTransactions(
  opts = {},
  awaitAfterFetch = false,
) {
  const actions = createActionCreators('read', {
    resourceType: 'transactions',
    requestKey: 'fetchTransactions',
    list: opts.address,
  });
  try {
    yield eff.put(actions.pending());
    const response = yield eff.call(
      api.getTransactions,
      opts,
    );
    const transactions = response.records.map(transaction => ({
      id: transaction.transactionHash,
      ...transaction,
    }));

    yield eff.put(actions.succeeded({
      resources: transactions,
    }));
    if (awaitAfterFetch) {
      yield eff.all(
        transactions.map(
          transaction => eff.fork(
            awaitTransaction,
            transaction.transactionHash,
          ),
        ),
      );
    }
  } catch (err) {
    console.log(err);
    yield eff.put(actions.succeeded({
      resources: [],
    }));
  }
}
