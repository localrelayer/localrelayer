// @flow
import React from 'react';

import type {
  Node,
} from 'react';

import {
  coreSelectors as cs,
} from 'localrelayer-core';
import * as webSelectors from 'web-selectors';
import {
  uiActions,
} from 'web-actions';

import Component from 'web-components/ConnectComponent';
import Header from 'web-components/Header';


const HeaderContainer = (): Node => (
  <Component
    mapStateToProps={state => ({
      currentAssetPair: webSelectors.getCurrentAssetPair(state),
      isTransactionsPanelIsVisible: webSelectors.getUiState('isTransactionsPanelIsVisible')(state),
      isTokensPanelIsVisible: webSelectors.getUiState('isTokensPanelIsVisible')(state),
      isSocketConnected: webSelectors.getUiState('isSocketConnected')(state),
      pendingTransactionsCount: cs.getPendingTransactions(state).length,
      address: cs.getWalletState('selectedAccount')(state),
      networkId: cs.getWalletState('networkId')(state),
      isNetworkSupported: webSelectors.getUiState('isNetworkSupported')(state),
    })}
  >
    {({
      dispatch,
      currentAssetPair,
      isTransactionsPanelIsVisible,
      isTokensPanelIsVisible,
      isSocketConnected,
      pendingTransactionsCount,
      address,
      networkId,
      isNetworkSupported,
    }) => (
      <Header
        currentAssetPair={currentAssetPair}
        pendingTransactionsCount={pendingTransactionsCount}
        address={address}
        networkId={networkId}
        isSocketConnected={isSocketConnected}
        isNetworkSupported={isNetworkSupported}
        onSetupGuideClick={() => (
          dispatch(uiActions.setUiState({
            isSetupGuideVisible: true,
          }))
        )}
        onTransactionsClick={() => {
          dispatch(uiActions.setUiState({
            isTransactionsPanelIsVisible: !isTransactionsPanelIsVisible,
          }));
        }}
        onTokensClick={() => {
          dispatch(uiActions.setUiState({
            isTokensPanelIsVisible: !isTokensPanelIsVisible,
          }));
        }}
      />
    )}
  </Component>
);

export default HeaderContainer;
