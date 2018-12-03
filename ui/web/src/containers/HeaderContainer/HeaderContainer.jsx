// @flow
import React from 'react';

import type {
  Node,
} from 'react';

import {
  coreSelectors as cs,
} from 'instex-core';
import {
  getCurrentAssetPair,
  getUiState,
} from 'web-selectors';

import Component from 'web-components/ConnectComponent';
import Header from 'web-components/Header';
import {
  getHistory,
} from '../../history';

const HeaderContainer = (): Node => (
  <Component
    mapStateToProps={state => ({
      historyType: getUiState('historyType')(state),
      listedAssetPairs: cs.getListedAssetPairs(state),
      currentAssetPair: getCurrentAssetPair(state),
    })}
  >
    {({
      historyType,
      listedAssetPairs,
      currentAssetPair,
    }) => (
      <Header
        listedAssetPairs={listedAssetPairs}
        currentAssetPair={currentAssetPair}
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
