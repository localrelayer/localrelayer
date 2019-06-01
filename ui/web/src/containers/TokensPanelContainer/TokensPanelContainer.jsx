// @flow
import React from 'react';

import type {
  Node,
} from 'react';

import Component from 'web-components/ConnectComponent';
import TokensPanel from 'web-components/TokensPanel';

import {
  uiActions,
} from 'web-actions';
import {
  getUiState,
  getQuoteTokens,
} from 'web-selectors';
import {
  coreSelectors as cs,
} from 'localrelayer-core';
import {
  getHistory,
} from '../../history';

const TransactionsPanelContainer = (): Node => (
  <Component
    mapStateToProps={state => ({
      isVisible: getUiState('isTokensPanelIsVisible')(state),
      listedAssetPairs: cs.getListedAssetPairs(state),
      historyType: getUiState('historyType')(state),
      quoteTokens: getQuoteTokens(state),
    })}
  >
    {({
      isVisible,
      listedAssetPairs,
      historyType,
      dispatch,
      quoteTokens,
    }) => (
      <TokensPanel
        isVisible={isVisible}
        listedAssetPairs={listedAssetPairs}
        quoteTokens={quoteTokens}
        onClose={() => {
          dispatch(uiActions.setUiState({
            isTokensPanelIsVisible: false,
          }));
        }}
        onPairClick={({
          assetDataA,
          assetDataB,
        }) => {
          dispatch(uiActions.setUiState({
            isTokensPanelIsVisible: false,
          }));
          const history = getHistory(historyType);
          history.push(`${assetDataA.assetData.symbol}-${assetDataB.assetData.symbol}`);
        }}
      />
    )}
  </Component>
);

export default TransactionsPanelContainer;
