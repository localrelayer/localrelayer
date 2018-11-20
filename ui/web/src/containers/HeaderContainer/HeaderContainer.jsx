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
} from 'web-selectors';

import Component from 'web-components/ConnectComponent';
import Header from 'web-components/Header';

const HeaderContainer = (): Node => (
  <Component
    mapStateToProps={state => ({
      listedAssetPairs: cs.getListedAssetPairs(state),
      currentAssetPair: getCurrentAssetPair(state),
    })}
  >
    {({
      listedAssetPairs,
      currentAssetPair,
    }) => (
      <Header
        listedAssetPairs={listedAssetPairs}
        currentAssetPair={currentAssetPair}
      />
    )}
  </Component>
);

export default HeaderContainer;
