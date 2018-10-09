// @flow
import * as eff from 'redux-saga/effects';

import {
  eventChannel,
  channel,
} from 'redux-saga';
import {
  matchPath,
} from 'react-router';

import {
  coreSagas,
  coreActions,
} from 'instex-core';

import config from 'web-config';

import {
  actionTypes,
  uiActions,
} from 'web-actions';
import {
  getUiState,
} from 'web-selectors';
import {
  getHistory,
} from 'web-history';


function* setCurrentPair({
  location,
  webRadioChannel,
  networkId,
}) {
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
        networkId,
      });
      const currentAssetPairId = yield eff.select(getUiState('currentAssetPairId'));
      yield eff.put(uiActions.setUiState({
        currentAssetPairId: assetPair.id,
        isCurrentPairListed: isListed,
        isCurrentPairIssue: false,
      }));

      // Unsubscribe after pair change
      if (currentAssetPairId) {
        yield eff.put(coreActions.sendSocketMessage(
          'unsubscribe',
          {
            pair: currentAssetPairId,
          },
        ));
      }
      yield eff.put(coreActions.sendSocketMessage(
        'subscribe',
        {
          pairs: [
            assetPair.id,
          ],
        },
      ));


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
      yield eff.put(
        webRadioChannel,
        {
          sagaName: 'setCurrentPair',
          message: {
            assetPair,
          },
        },
      );
    } catch (errors) {
      yield eff.put(uiActions.setUiState({
        isCurrentPairIssue: true,
        currentPairErrors: errors,
      }));
    }
  }
}

function* takeChangeRoute({
  historyChannel,
  webRadioChannel,
  networkId,
}) {
  while (true) {
    const { location } = yield eff.take(historyChannel);
    yield eff.fork(
      setCurrentPair,
      {
        location,
        webRadioChannel,
        networkId,
      },
    );
  }
}

export function* initialize(): Saga<void> {
  yield eff.take(actionTypes.INITIALIZE_WEB_APP);
  console.log('Web initialize saga');

  const networkId = yield eff.call(web3.eth.net.getId);
  const webRadioChannel = yield eff.call(channel);
  const fetchPairsTask = yield eff.fork(
    coreSagas.fetchAssetPairs,
    {
      networkId,
    },
  );

  const sputnikSocket = yield eff.call(coreSagas.sputnikConnect, config.sputnikUrl);
  yield eff.fork(coreSagas.handleSputnikSocketIO, sputnikSocket);

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
  yield eff.fork(
    takeChangeRoute,
    {
      historyChannel,
      webRadioChannel,
      networkId,
    },
  );

  yield eff.put(uiActions.setUiState({
    isAppInitializing: false,
  }));
  yield eff.join(fetchPairsTask);
  yield eff.fork(
    setCurrentPair,
    {
      location: history.location,
      webRadioChannel,
      networkId,
    },
  );

  /* Web radio center */
  while (true) {
    const {
      sagaName,
      message,
    } = yield eff.take(webRadioChannel);
    let watchWalletTask;

    switch (sagaName) {
      case 'setCurrentPair':
        if (watchWalletTask) {
          yield eff.cancel(watchWalletTask);
        }
        watchWalletTask = yield eff.fork(
          coreSagas.watchWallet,
          {
            delay: 2000,
            tokens: [
              message.assetPair.assetDataA.assetData,
              message.assetPair.assetDataB.assetData,
            ],
          },
        );
        break;
      default:
        break;
    }
  }
}
