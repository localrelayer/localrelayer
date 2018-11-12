// @flow
import {
  assetDataUtils,
} from '0x.js';
import uuidv4 from 'uuid/v4';
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


function* subscribeOnCurrentTradingInfo(): Saga<void> {
  const networkId = yield eff.select(getUiState('networkId'));
  const currentAssetPairId = yield eff.select(getUiState('currentAssetPairId'));
  const requestId = uuidv4();

  yield eff.put(uiActions.setUiState({
    tradingInfoSubscribeId: requestId,
  }));
  yield eff.put(coreActions.sendSocketMessage({
    type: 'subscribe',
    channel: 'tradingInfo',
    requestId,
    payload: {
      pairs: [{
        assetDataA: currentAssetPairId.split('_')[0],
        assetDataB: currentAssetPairId.split('_')[1],
        networkId,
      }],
    },
  }));
}

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
      const tradingInfoSubscribeId = yield eff.select(getUiState('tradingInfoSubscribeId'));
      yield eff.put(uiActions.setUiState({
        currentAssetPairId: assetPair.id,
        isCurrentPairListed: isListed,
        isCurrentPairIssue: false,
      }));

      /* Unsubscribe after pair change */
      if (currentAssetPairId && tradingInfoSubscribeId) {
        yield eff.put(coreActions.sendSocketMessage({
          type: 'unsubscribe',
          requestId: tradingInfoSubscribeId,
        }));
      }
      yield eff.fork(subscribeOnCurrentTradingInfo);
      yield eff.fork(
        coreSagas.fetchTradingInfo,
        {
          pairs: [{
            networkId,
            assetDataA: assetPair.assetDataA.assetData,
            assetDataB: assetPair.assetDataB.assetData,
          }],
        },
      );
      yield eff.fork(
        coreSagas.fetchOrderBook,
        {
          networkId,
          baseAssetData: assetPair.assetDataA.assetData,
          quoteAssetData: assetPair.assetDataB.assetData,
        },
      );
      yield eff.fork(
        coreSagas.fetchTradingHistory,
        {
          networkId,
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
      console.log(errors);
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

function socketCloseChannel(socket) {
  return eventChannel((emit) => {
    socket.onclose = (data) => emit(data); /* eslint-disable-line */
    socket.onerror = (data) => emit(data); /* eslint-disable-line */
    return () => {};
  });
}

function* socketConnect(): Saga<void> {
  let isReconnect = false;
  let delay = 0;
  while (true) {
    const socket = yield eff.call(
      coreSagas.socketConnect,
      config.socketUrl,
    );
    if (socket.readyState === 1) {
      delay = 0;
      if (isReconnect) {
        yield eff.fork(subscribeOnCurrentTradingInfo);
      }
    }
    const onCloseChannel = socketCloseChannel(socket);
    const task = yield eff.fork(coreSagas.handleSocketIO, socket);
    yield eff.take(onCloseChannel);
    yield eff.cancel(task);
    yield eff.delay(delay);
    if (delay < 5000) {
      delay += 500;
    }
    isReconnect = true;
  }
}

export function* initialize(): Saga<void> {
  const { historyType } = yield eff.take(actionTypes.INITIALIZE_WEB_APP);
  console.log('Web initialize saga');

  const networkId = yield eff.call(web3.eth.net.getId);
  yield eff.put(uiActions.setUiState({
    networkId,
  }));
  const webRadioChannel = yield eff.call(channel);
  const fetchPairsTask = yield eff.fork(
    coreSagas.fetchAssetPairs,
    {
      networkId,
    },
  );
  yield eff.fork(socketConnect);

  const history = getHistory(historyType);
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
  yield eff.fork(coreSagas.takeApproval);
  yield eff.fork(coreSagas.takeDepositAndWithdraw);

  let watchWalletTask;
  /* Web radio center */
  while (true) {
    const {
      sagaName,
      message,
    } = yield eff.take(webRadioChannel);

    switch (sagaName) {
      case 'setCurrentPair': {
        if (watchWalletTask) {
          yield eff.cancel(watchWalletTask);
        }
        const { tokenAddress: tokenA } = assetDataUtils.decodeAssetDataOrThrow(
          message.assetPair.assetDataA.assetData,
        );
        const { tokenAddress: tokenB } = assetDataUtils.decodeAssetDataOrThrow(
          message.assetPair.assetDataB.assetData,
        );
        watchWalletTask = yield eff.fork(
          coreSagas.watchWallet,
          {
            delay: 5000,
            tokens: [
              tokenA,
              tokenB,
            ],
          },
        );
        break;
      }
      default:
        break;
    }
  }
}
