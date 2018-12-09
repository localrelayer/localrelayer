// @flow
import React from 'react';

import type {
  Node,
} from 'react';

import Component from 'web-components/ConnectComponent';
import TransactionsPanel from 'web-components/TransactionsPanel';

import {
  coreSelectors as cs,
} from 'instex-core';
import {
  uiActions,
} from 'web-actions';
import {
  getUiState,
  getNotifications,
} from 'web-selectors';


const TransactionsPanelContainer = (): Node => (
  <Component
    mapStateToProps={state => ({
      visible: getUiState('isTransactionsPanelIsVisible')(state),
      notifications: getNotifications(state),
      networkId: cs.getWalletState('networkId')(state),
    })}
  >
    {({
      visible,
      notifications,
      networkId,
      dispatch,
    }) => (
      <TransactionsPanel
        visible={visible}
        notifications={notifications}
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
