// @flow
import React from 'react';

import type {
  Node,
} from 'react';

import {
  coreSelectors as cs,
} from 'instex-core';
import * as webSelectors from 'web-selectors';
import {
  uiActions,
} from 'web-actions';

import Component from 'web-components/ConnectComponent';
import Header from 'web-components/Header';
import {
  getHistory,
} from '../../history';


const HeaderContainer = (): Node => (
  <Component
    mapStateToProps={state => ({
      historyType: webSelectors.getUiState('historyType')(state),
      listedAssetPairs: cs.getListedAssetPairs(state),
      currentAssetPair: webSelectors.getCurrentAssetPair(state),
      isTransactionsPanelIsVisible: webSelectors.getUiState('isTransactionsPanelIsVisible')(state),
      isSocketConnected: webSelectors.getUiState('isSocketConnected')(state),
      pendingTransactionsCount: cs.getPendingTransactions(state).length,
      address: cs.getWalletState('selectedAccount')(state),
    })}
  >
    {({
      dispatch,
      historyType,
      listedAssetPairs,
      currentAssetPair,
      isTransactionsPanelIsVisible,
      isSocketConnected,
      pendingTransactionsCount,
      address,
    }) => (
      <Header
        listedAssetPairs={listedAssetPairs}
        currentAssetPair={currentAssetPair}
        pendingTransactionsCount={pendingTransactionsCount}
        address={address}
        isSocketConnected={isSocketConnected}
        onTransactionsClick={() => {
          dispatch(uiActions.setUiState({
            isTransactionsPanelIsVisible: !isTransactionsPanelIsVisible,
          }));
        }}
        onPairClick={({
          assetDataA,
          assetDataB,
        }) => {
          const history = getHistory(historyType);
          history.push(`${assetDataA.assetData.symbol}-${assetDataB.assetData.symbol}`);
        }}
      />
    )}
  </Component>
);

export default HeaderContainer;
