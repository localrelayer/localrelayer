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
  getUiState,
} from 'web-selectors';
import {
  getHistory,
} from 'web-history';
import store from 'web-store';


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
    } catch (errors) {
      yield eff.put(uiActions.setUiState({
        isCurrentPairIssue: true,
        currentPairErrors: errors,
      }));
    }
  }
}


function* takeChangeRoute(channel) {
  while (true) {
    const { location } = yield eff.take(channel);
    yield eff.fork(setCurrentPair, location);
  }
}

function* takeChangeMetamaskWalletData(channel) {
  const ethNetworks = {
    1: 'Main Ethereum Network',
    42: 'Kovan Test Network',
  };

  while (true) {
    const {
      networkId,
      accounts,
    } = yield eff.take(channel);

    yield eff.put(
      uiActions.setUiState(
        'wallet', {
          ...(accounts ? {
            accounts,
            selectedAccount: accounts[0],
          } : {}),
          ...(networkId ? {
            networkId,
            networkName: ethNetworks[networkId] || 'Unknown',
          } : {}),
        },
        [
          'wallet',
        ],
      ),
    );
  }
}

function createWalletChannel() {
  let timeout;

  function checkFunc(emitter) {
    timeout = setTimeout(() => {
      web3.eth.net.getId().then((networkId) => {
        web3.eth.getAccounts().then((accounts) => {
          const changedData = [];
          const wallet = getUiState('wallet')(store.getState());

          if (wallet.networkId !== networkId) {
            changedData.push({
              networkId,
            });
          }
          if (accounts.some((w, i) => wallet.accounts[i] !== w)) {
            changedData.push({
              accounts,
            });
          }

          if (changedData.length) {
            emitter({
              ...(changedData.reduce(
                (acc, data) => ({
                  ...acc,
                  ...data,
                }),
                {},
              )),
            });
          }

          checkFunc(emitter);
        });
      });
    }, 2000);
  }

  return eventChannel(
    (emitter) => {
      checkFunc(emitter);
      return (
        () => clearTimeout(timeout)
      );
    },
  );
}

export function* initialize(): Saga<void> {
  yield eff.take(actionTypes.INITIALIZE_WEB_APP);

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
  yield eff.fork(takeChangeRoute, historyChannel);

  const walletChannel = createWalletChannel();
  yield eff.fork(takeChangeMetamaskWalletData, walletChannel);

  yield eff.put(uiActions.setUiState({
    isAppInitializing: false,
  }));
  yield eff.join(fetchPairsTask);
  yield eff.fork(setCurrentPair, history.location);
}
