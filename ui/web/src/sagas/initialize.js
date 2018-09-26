// @flow
import * as eff from 'redux-saga/effects';

import {
  eventChannel,
} from 'redux-saga';
import {
  matchPath,
} from 'react-router';

import {
  coreSagas,
} from 'instex-core';

import {
  actionTypes,
  uiActions,
} from 'web-actions';
import {
  getHistory,
} from 'web-history';


function* setCurrentPair(location) {
  const match = matchPath(location.pathname, {
    path: '/:baseAsset-:quoteAsset',
    exact: true,
    strict: false,
  }) || {
    params: {
      baseAsset: 'ZRX',
      quoteAsset: 'WETH',
    },
  };
  if (
    match
    || location.pathname === '/'
  ) {
    try {
      const {
        assetPair,
        isListed,
      } = yield eff.call(coreSagas.checkAssetPair, {
        baseAsset: match.params.baseAsset,
        quoteAsset: match.params.quoteAsset,
      });
      yield eff.put(uiActions.setUiState({
        currentAssetPairId: assetPair.id,
        isCurrentPairListed: isListed,
        isCurrentPairIssue: false,
      }));
      yield eff.fork(
        coreSagas.fetchOrderBook,
        {
          baseAssetData: assetPair.assetDataA.assetData,
          quoteAssetData: assetPair.assetDataB.assetData,
        },
      );
      /* fetch orderbook */
    } catch (errors) {
      yield eff.put(uiActions.setUiState({
        isCurrentPairIssue: true,
        currentPairErrors: errors,
      }));
    }
  }
}


function* onChangeRoute(channel) {
  while (true) {
    const { location } = yield eff.take(channel);
    yield eff.fork(setCurrentPair, location);
  }
}

export function* initialize(): Saga<void> {
  console.log('Web initialize saga');
  const fetchPairsTask = yield eff.fork(coreSagas.fetchAssetPairs);

  const history = getHistory();
  const historyChannel = eventChannel(
    emitter => (
      history.listen((location, action) => {
        emitter({
          location,
          action,
        });
      })
    ),
  );
  yield eff.fork(onChangeRoute, historyChannel);

  yield eff.put(uiActions.setUiState({
    isAppInitializing: false,
  }));
  yield eff.join(fetchPairsTask);
  yield eff.fork(setCurrentPair, history.location);
}

export function* takeInitializeWebApp() {
  yield eff.takeEvery(
    actionTypes.INITIALIZE_WEB_APP,
    initialize,
  );
}
