// @flow
import React from 'react';

import type {
  Node,
} from 'react';

import Component from 'web-components/ConnectComponent';
import TransactionsPanel from 'web-components/TransactionsPanel';

import {
  coreSelectors as cs,
} from 'localrelayer-core';
import {
  uiActions,
} from 'web-actions';
import {
  getUiState,
} from 'web-selectors';


const TransactionsPanelContainer = (): Node => (
  <Component
    mapStateToProps={state => ({
      visible: getUiState('isTransactionsPanelIsVisible')(state),
      transactions: cs.getTransactions(state),
      networkId: cs.getWalletState('networkId')(state),
    })}
  >
    {({
      visible,
      transactions,
      networkId,
      dispatch,
    }) => (
      <TransactionsPanel
        visible={visible}
        transactions={transactions}
        networkId={networkId}
        onClose={() => {
          dispatch(uiActions.setUiState({
            isTransactionsPanelIsVisible: !visible,
          }));
        }}
      />
    )}
  </Component>
);

export default TransactionsPanelContainer;
