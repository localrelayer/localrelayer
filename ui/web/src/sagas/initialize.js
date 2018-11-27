// @flow
import {
  assetDataUtils,
} from '0x.js';
import {
  ExchangeContractErrs,
} from '@0x/types';
import uuidv4 from 'uuid/v4';
import * as eff from 'redux-saga/effects';
import createActionCreators from 'redux-resource-action-creators';

import {
  eventChannel,
  channel,
} from 'redux-saga';
import {
  matchPath,
} from 'react-router';

import {
  coreSagas,
  coreSelectors,
  coreActions,
  api,
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
import {
  takeSubscribeOnChangeChartBar,
} from './chart';


function* subscribeOnUpdateOrders(): Saga<void> {
  const networkId = yield eff.select(getUiState('networkId'));
  const currentAssetPairId = yield eff.select(getUiState('currentAssetPairId'));
  const requestId = uuidv4();

  yield eff.put(uiActions.setUiState({
    ordersSubscribeId: requestId,
  }));
  yield eff.put(coreActions.sendSocketMessage({
    type: 'subscribe',
    channel: 'orders',
    requestId,
    payload: {
      makerAssetData: currentAssetPairId.split('_')[0],
      takerAssetData: currentAssetPairId.split('_')[1],
      networkId,
    },
  }));
}

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
      const ordersSubscribeId = yield eff.select(getUiState('ordersSubscribeId'));

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

      /* Unsubscribe after pair change */
      if (
        currentAssetPairId
        && ordersSubscribeId
      ) {
        yield eff.put(coreActions.sendSocketMessage({
          type: 'unsubscribe',
          ordersSubscribeId,
        }));
      }
      yield eff.fork(subscribeOnUpdateOrders);

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
      const selectedAccount = yield eff.select(
        coreSelectors.getWalletState('selectedAccount'),
      );
      if (selectedAccount) {
        yield eff.fork(
          coreSagas.fetchUserOrders,
          {
            networkId,
            baseAssetData: assetPair.assetDataA.assetData,
            quoteAssetData: assetPair.assetDataB.assetData,
            traderAddress: selectedAccount,
          },
        );
      }
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

function* takeUpdateOrder(socketChannel) {
  const orderFillChannel = yield eff.call(channel);
  yield eff.fork(
    takeSubscribeOnChangeChartBar,
    orderFillChannel,
  );
  const actions = createActionCreators('read', {
    resourceType: 'orders',
    requestKey: 'orders',
    mergeListIds: true,
  });

  const traderAddress = yield eff.select(coreSelectors.getWalletState('selectedAccount'));
  while (true) {
    const lists = [];
    const data = yield eff.take(socketChannel);

    /* Determine whether the order should be placed to userOrders list */
    if (
      data.channel === 'orders'
      && data.type === 'update'
      && (
        data.payload.metaData.isValid === true
        || data.payload.metaData.isShadowed === true
      )
      && (
        data.payload.order.makerAddress === traderAddress
        || data.payload.order.takerAddress === traderAddress
      )
    ) {
      lists.push('userOrders');
    }

    if (
      data.channel === 'orders'
      && data.type === 'update'
      && data.payload.metaData.isValid === false
    ) {
      if (data.payload.metaData.error === ExchangeContractErrs.OrderRemainingFillAmountZero) {
        lists.push('tradingHistory');
        yield eff.put(
          orderFillChannel,
          data.payload,
        );
      }
      yield eff.put(actions.succeeded({
        lists,
        resources: [{
          id: data.payload.metaData.orderHash,
          metaData: data.payload.metaData,
          ...data.payload.order,
        }],
      }));
    }

    if (
      data.channel === 'orders'
      && data.type === 'update'
      && data.payload.metaData.isValid === true
    ) {
      const currentAssetPairId = yield eff.select(getUiState('currentAssetPairId'));
      const [baseAssetData] = currentAssetPairId.split('_');
      lists.push((
        baseAssetData === data.payload.order.makerAssetData
          ? (
            'asks'
          )
          : (
            'bids'
          )
      ));
      yield eff.put(actions.succeeded({
        lists,
        resources: [{
          id: data.payload.metaData.orderHash,
          metaData: data.payload.metaData,
          ...data.payload.order,
        }],
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

function* socketConnect(socketChannel): Saga<void> {
  let isReconnect = false;
  let delay = 0;
  while (true) {
    const socket = new WebSocket(config.socketUrl);
    if (socket.readyState === 1) {
      delay = 0;
      if (isReconnect) {
        yield eff.fork(subscribeOnCurrentTradingInfo);
        yield eff.fork(subscribeOnUpdateOrders);
      }
    }
    const [
      task,
      closeSocketChannel,
    ] = yield eff.call(
      coreSagas.handleSocketIO,
      {
        socket,
        socketChannel,
      },
    );
    yield eff.take(closeSocketChannel);
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
  api.setApiUrl(config.apiUrl);
  console.log('Web initialize saga');

  const networkId = yield eff.call(web3.eth.net.getId);
  const accounts = yield eff.call(web3.eth.getAccounts);
  const selectedAccount = accounts.length ? accounts[0].toLowerCase() : null;
  yield eff.put(
    coreActions.setWalletState({
      networkId,
      selectedAccount,
    }),
  );
  yield eff.put(uiActions.setUiState({
    networkId,
  }));
  const webRadioChannel = yield eff.call(channel);
  const socketChannel = yield eff.call(channel);
  const fetchPairsTask = yield eff.fork(
    coreSagas.fetchAssetPairs,
    {
      networkId,
    },
  );

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
    socketConnect,
    socketChannel,
  );
  yield eff.fork(
    takeChangeRoute,
    {
      historyChannel,
      webRadioChannel,
      networkId,
    },
  );

  yield eff.join(fetchPairsTask);
  yield eff.fork(
    takeUpdateOrder,
    socketChannel,
  );
  yield eff.put(uiActions.setUiState({
    isAppInitializing: false,
  }));
  yield eff.fork(coreSagas.takeApproval);
  yield eff.fork(coreSagas.takeDepositAndWithdraw);
  yield eff.fork(coreSagas.takePostOrder);
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
