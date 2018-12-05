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
  getNotifications,
} from 'web-selectors';
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
      historyType: getUiState('historyType')(state),
      listedAssetPairs: cs.getListedAssetPairs(state),
      currentAssetPair: getCurrentAssetPair(state),
      isNotificationsPanelIsVisible: getUiState('isNotificationsPanelIsVisible')(state),
      notifications: getNotifications(state),
    })}
  >
    {({
      dispatch,
      historyType,
      listedAssetPairs,
      currentAssetPair,
      isNotificationsPanelIsVisible,
      notifications,
    }) => (
      <Header
        listedAssetPairs={listedAssetPairs}
        currentAssetPair={currentAssetPair}
        notifications={notifications}
        onNotificationsClick={() => {
          dispatch(uiActions.setUiState({
            isNotificationsPanelIsVisible: !isNotificationsPanelIsVisible,
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
