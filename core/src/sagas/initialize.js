// @flow
import {
  call,
  put,
  fork,
  select,
  takeEvery,
} from 'redux-saga/effects';
import {
  reset,
} from 'redux-form';
import type {
  Saga,
} from 'redux-saga';
import {
  getLocation,
} from 'react-router-redux';
import pathToRegexp from 'path-to-regexp';
import {
  fetchResourcesRequest,
  saveResourceRequest,
} from './resources';
import {
  connectionStatuses,
  SMALLEST_AMOUNT,
  BIGGEST_AMOUNT,
} from '../utils/web3';
import {
  startWeb3,
} from './ethereum';
import * as ProfileActions from '../actions/profile';
import {
  loadTokensBalance,
  runLoadEthPrice,
  watchNewMetamaskAccount,
} from './profile';
import {
  loadOrders,
} from './orders';
import {
  changeProvider,
  showModal,
  setUiState,
} from '../actions';
import {
  getResourceMappedList,
  getCurrentToken,
  getCurrentPair,
} from '../selectors';
import BigNumber from '../utils/BigNumber';
import WETH from '../utils/WETH';

export function* initialize(): Saga<void> {
  yield call(fetchResourcesRequest, {
    payload: {
      resourceName: 'tokens',
      list: 'allTokens',
      request: 'fetchTokens',
      withDeleted: false,
      fetchQuery: {
        sortBy: 'symbol',
      },
    },
  });
  yield call(startWeb3);

  yield call(setTokens);
  yield call(loadOrders);

  yield fork(runLoadEthPrice);

  if (!window.web3Instance) {
    yield put(
      showModal({
        title: 'You are not connected to Ethereum',
        type: 'info',
        name: 'DowloadMetamask',
      }),
    );
    yield put(ProfileActions.setProfileState('connectionStatus', connectionStatuses.NOT_CONNECTED));
  } else {
    yield put(changeProvider('metamask'));
    yield fork(watchNewMetamaskAccount);

    if (process.env.NODE_ENV === 'production') {
      yield put(
        showModal({
          title: 'Max order is temporary limited to 1 ETH',
          type: 'info',
        }),
      );
    }

    // using window as transport
    window.BIGGEST_AMOUNT = BigNumber(BIGGEST_AMOUNT).toFixed(8).toString();
    window.SMALLEST_AMOUNT = SMALLEST_AMOUNT;
    yield fork(listenRouteChange);
  }
}


export function* setTokens(): Saga<void> {
  const { zeroEx } = window;
  // const address = yield select(getProfileState('address'));

  yield put(reset('BuySellForm'));
  yield put(setUiState('bannerMessage', null));

  const { pathname } = yield select(getLocation);
  const tokens = yield select(getResourceMappedList('tokens', 'allTokens'));
  const reg = pathToRegexp('/:token-:pair');
  const [a, token = '', pair = ''] = reg.exec(pathname) || []; // eslint-disable-line

  let selectedToken =
    tokens.find(t => (t.symbol === token || t.id === token.toLowerCase()) && t.is_listed);
  const pairToken =
    tokens.find(t => (t.symbol === pair || t.id === pair.toLowerCase()) && t.is_listed);
  const networkZrxAddress = zeroEx ?
    yield call([zeroEx.exchange, zeroEx.exchange.getZRXTokenAddress]) : null;
  const networkWethAddress = zeroEx ?
    yield call([
      zeroEx.tokenRegistry, zeroEx.tokenRegistry.getTokenAddressBySymbolIfExistsAsync,
    ], 'WETH') : null;

  const zrxToken = tokens.find(t => t.symbol === 'ZRX' || t.id === networkZrxAddress) || {};
  const wethToken = tokens.find(t => t.symbol === 'WETH' || t.id === networkWethAddress) || {};

  if (!selectedToken && window.web3Instance && window.web3Instance.utils.isAddress(token)) {
    const deployed = new window.web3Instance.eth.Contract(WETH, token);
    try {
      const name = yield call(deployed.methods.name().call);
      const symbol = yield call(deployed.methods.symbol().call);
      const decimals = yield call(deployed.methods.decimals().call);
      const responseUrlToken = yield call(fetchResourcesRequest, {
        payload: {
          resourceName: 'tokens',
          request: 'fetchUrlToken',
          withDeleted: false,
          fetchQuery: {
            sortBy: 'symbol',
            filterCondition: {
              filter: {
                'address': token.toLowerCase(),
              },
            },
          },
        },
      });
      const foundToken = responseUrlToken.data.find(t => t.id === token.toLowerCase());

      yield put(setUiState('bannerMessage', 'You are trading not listed token, please be aware of scam and double check the address'));

      if (foundToken) {
        selectedToken = foundToken;
      } else if (name && symbol && decimals) {
      // Create new token (not listed)
        const resp = yield call(saveResourceRequest, {
          payload: {
            resourceName: 'tokens',
            request: 'createToken',
            data: {
              attributes: {
                address: token.toLowerCase(),
                name,
                symbol,
                decimals,
              },
              resourceName: 'tokens',
            },
          },
        });
        selectedToken = resp.data;
      }
    } catch (e) {
      yield put(showModal({
        title: "Couldn't find token by address",
        name: 'NoToken',
        type: 'warning',
      }));
      console.error(e);
    }
  }

  yield put(setUiState('currentTokenId', selectedToken ? selectedToken.id : zrxToken.id));
  yield put(setUiState('currentPairId', pairToken ? pairToken.id : wethToken.id));
}

function* checkNewToken({ payload: { pathname } }): Saga<void> {
  const tokens = yield select(getResourceMappedList('tokens', 'allTokens'));
  const reg = pathToRegexp('/:token-:pair');
  const [a, token, pair] = reg.exec(pathname) || []; // eslint-disable-line

  if (!pair && !token) {
    return;
  }

  const tokenItem =
    tokens.find(t => t.symbol === token || t.id === token.toLowerCase()) || {};
  const pairItem =
    tokens.find(t => (t.symbol === pair || t.id === pair.toLowerCase()) && t.is_listed) || {};

  const currentToken = yield select(getCurrentToken);
  const currentPair = yield select(getCurrentPair);
  if (tokenItem.id !== currentToken.id || pairItem.id !== currentPair.id) {
    yield call(setTokens);
    yield call(loadTokensBalance);
    yield call(loadOrders);
  }
}

export function* listenRouteChange(): Saga<void> {
  yield takeEvery('@@router/LOCATION_CHANGE', checkNewToken);
}
