// @flow
import React from 'react';

import type {
  Node,
} from 'react';

import {
  getCurrentAssetPair,
  getUiState,
} from 'web-selectors';
import Component from 'web-components/ConnectComponent';
import AssetPairCard from 'web-components/AssetPairCard';


const AssetPairCardContainer = (): Node => (
  <Component
    mapStateToProps={state => ({
      assetPair: getCurrentAssetPair(state),
      isAppInitializing: getUiState('isAppInitializing')(state),
    })}
  >
    {({
      assetPair,
      isAppInitializing,
    }) => (
      <AssetPairCard
        assetPair={assetPair}
        loading={isAppInitializing}
      />
    )}
  </Component>
);

export default AssetPairCardContainer;
