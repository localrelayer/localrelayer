// @flow
import {
  assetDataUtils,
  BigNumber,
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
  const traderAddress = yield eff.select(coreSelectors.getWalletState('selectedAccount'));
  const requestId = uuidv4();

  yield eff.put(uiActions.setUiState({
    ordersSubscribeId: requestId,
  }));
  yield eff.put(coreActions.sendSocketMessage({
    type: 'subscribe',
    channel: 'orders',
    requestId,
    payload: {
      ...(
        currentAssetPairId
          ? {
            makerAssetData: currentAssetPairId.split('_')[0],
            takerAssetData: currentAssetPairId.split('_')[1],
          } : {}
      ),
      traderAddress,
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

function* initializeRoute({
  location,
  webRadioChannel,
  networkId,
}) {
  const selectedAccount = yield eff.select(coreSelectors.getWalletState('selectedAccount'));
  /* fetch pending transactions */
  yield eff.fork(
    coreSagas.fetchTransactions,
    {
      networkId,
      address: selectedAccount,
      type: 'pending',
    },
    true,
  );
  /* fetch finished transactions, it's temporary, the componen on did mount will fetch it */
  yield eff.fork(
    coreSagas.fetchTransactions,
    {
      networkId,
      address: selectedAccount,
    },
  );
  yield eff.put(uiActions.setUiState({
    pathname: location.pathname,
  }));
  const matchTradingPage = (
    location.pathname === '/'
      ? ({
        params: {
          baseAsset: 'ZRX',
          quoteAsset: 'WETH',
        },
      })
      : (
        matchPath(location.pathname, {
          path: '/:baseAsset-:quoteAsset',
          exact: true,
          strict: false,
        })
      )
  );
  const matchProfilePage = location.pathname === '/account';

  const tradingInfoSubscribeId = yield eff.select(getUiState('tradingInfoSubscribeId'));
  const ordersSubscribeId = yield eff.select(getUiState('ordersSubscribeId'));

  if (matchProfilePage) {
    if (tradingInfoSubscribeId) {
      yield eff.put(coreActions.sendSocketMessage({
        type: 'unsubscribe',
        requestId: tradingInfoSubscribeId,
      }));
      yield eff.put(uiActions.setUiState({
        tradingInfoSubscribeId: null,
      }));
    }
    /* TODO: fetch history for all pairs
    yield eff.fork(
      coreSagas.fetchTradingHistory,
      {
        networkId,
      },
    );
    */
    const allAssets = yield eff.select(coreSelectors.getResourceMappedList('assets'));
    yield eff.put(
      webRadioChannel,
      {
        messageType: 'runWalletWatcher',
        message: {
          delay: 5000,
          tokens: allAssets.map(asset => asset.address),
        },
      },
    );
  }
  if (matchTradingPage) {
    try {
      const {
        assetPair,
        isListed,
      } = yield eff.call(coreSagas.checkAssetPair, {
        baseAsset: matchTradingPage.params.baseAsset,
        quoteAsset: matchTradingPage.params.quoteAsset,
        networkId,
      });

      yield eff.put(uiActions.setUiState({
        currentAssetPairId: assetPair.id,
        isCurrentPairListed: isListed,
        isCurrentPairIssue: false,
      }));

      /* Unsubscribe after pair change */
      if (tradingInfoSubscribeId) {
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

      const { tokenAddress: tokenA } = assetDataUtils.decodeAssetDataOrThrow(
        assetPair.assetDataA.assetData,
      );
      const { tokenAddress: tokenB } = assetDataUtils.decodeAssetDataOrThrow(
        assetPair.assetDataB.assetData,
      );
      yield eff.put(
        webRadioChannel,
        {
          messageType: 'runWalletWatcher',
          message: {
            delay: 5000,
            tokens: [
              tokenA,
              tokenB,
            ],
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
  if (ordersSubscribeId) {
    yield eff.put(coreActions.sendSocketMessage({
      type: 'unsubscribe',
      requestId: ordersSubscribeId,
    }));
    yield eff.put(uiActions.setUiState({
      ordersSubscribeId: null,
    }));
  }
  yield eff.fork(subscribeOnUpdateOrders);
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
    if (data.channel === 'orders' && data.type === 'update') {
      /* Determine whether the order should be placed to userOrders list */
      if ((
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
        (
          data.payload.metaData.isValid === false
          && data.payload.metaData.error === ExchangeContractErrs.OrderRemainingFillAmountZero
        )
        || new BigNumber(data.payload.metaData.filledTakerAssetAmount).gt(0)
      ) {
        lists.push('tradingHistory');
        yield eff.put(
          orderFillChannel,
          data.payload,
        );
      }

      if (data.payload.metaData.isValid === true) {
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
      }

      console.log('Lists', lists);

      yield eff.put(actions.succeeded({
        lists,
        // prepend: true,
        removeFromOtherLists: true,
        resources: [{
          id: data.payload.order.signature,
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
      initializeRoute,
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
    historyType,
    networkId,
  }));
  yield eff.fork(
    coreSagas.fetchUserOrders,
    {
      networkId,
      traderAddress: selectedAccount,
    },
  );
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
  yield eff.fork(
    initializeRoute,
    {
      location: history.location,
      webRadioChannel,
      networkId,
    },
  );
  yield eff.put(uiActions.setUiState({
    isAppInitializing: false,
  }));
  yield eff.fork(coreSagas.takeApproval);
  yield eff.fork(coreSagas.takeDepositAndWithdraw);
  yield eff.fork(coreSagas.takePostOrder);
  yield eff.fork(coreSagas.takeCancelOrder);
  let watchWalletTask;
  /* Web radio center */
  while (true) {
    const {
      messageType,
      message,
    } = yield eff.take(webRadioChannel);

    switch (messageType) {
      case 'runWalletWatcher': {
        if (watchWalletTask) {
          yield eff.cancel(watchWalletTask);
        }
        watchWalletTask = yield eff.fork(
          coreSagas.watchWallet,
          message,
        );
        break;
      }
      default:
        break;
    }
  }
}
