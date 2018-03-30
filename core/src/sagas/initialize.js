// @flow
import {
  call,
  put,
  fork,
  select,
  cps,
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
import BigNumber from 'bignumber.js';
import {
  fetchResourcesRequest,
  saveResourceRequest,
} from './resources';
import {
  loadZeroEx,
  connectionStatuses,
  SMALLEST_AMOUNT,
} from '../utils/web3';
import * as ProfileActions from '../actions/profile';
import {
  runLoadUser,
  loadTokensBalance,
} from './profile';
import {
  loadOrders,
} from './orders';
import * as uiActions from '../actions/ui';
import EIP20 from '../../build/contracts/EIP20.json';
import {
  getResourceMappedList,
  getCurrentToken,
  getCurrentPair,
} from '../selectors';

export function* initialize(): Saga<void> {
  yield call(loadZeroEx);
  yield call(fetchResourcesRequest, {
    payload: {
      resourceName: 'tokens',
      list: 'allTokens',
      request: 'fetchTokens',
      withDeleted: false,
      fetchQuery: {
        sortBy: 'symbol',
        filterCondition: {
          // filter: {
          //   'is_listed': true,
          // },
        },
      },
    },
  });
  yield call(setTokens);
  yield call(loadOrders);

  // Prefilling buy/sell form
  // yield put(uiActions.fillField('price', { orderType: 'sell' }));
  yield put(uiActions.fillField('exp', { period: ['1', 'day'] }));
  if (!window.web3) {
    yield put(
      uiActions.showModal({
        title: 'You are not connected to Ethereum',
        type: 'info',
        name: 'DowloadMetamask',
      }),
    );
    yield put(ProfileActions.setProfileState('connectionStatus', connectionStatuses.NOT_CONNECTED));
  } else {
    // Max Amount - 10 eth
    const BIGGEST_AMOUNT = 10;

    // using window as transport
    window.BIGGEST_AMOUNT = BigNumber(BIGGEST_AMOUNT).toFixed(8).toString();
    window.SMALLEST_AMOUNT = SMALLEST_AMOUNT;

    yield fork(listenRouteChange);
    yield fork(runLoadUser);
  }
}


export function* setTokens(): Saga<void> {
  const { zeroEx } = window;

  yield put(reset('BuySellForm'));
  yield put(uiActions.setUiState('bannerMessage', null));

  const { pathname } = yield select(getLocation);
  const tokens = yield select(getResourceMappedList('tokens', 'allTokens'));
  const reg = pathToRegexp('/:token-:pair');
  const [a, token, pair] = reg.exec(pathname) || []; // eslint-disable-line

  let selectedToken =
    tokens.find(t => t.symbol === token || t.id === token);
  const pairToken =
    tokens.find(t => t.symbol === pair || t.id === pair);
  const networkZrxAddress = zeroEx ?
    yield call([zeroEx.exchange, zeroEx.exchange.getZRXTokenAddress]) : null;
  const networkWethAddress = zeroEx ?
    yield call([
      zeroEx.tokenRegistry, zeroEx.tokenRegistry.getTokenAddressBySymbolIfExistsAsync,
    ], 'WETH') : null;

  const zrxToken = tokens.find(t => t.symbol === 'ZRX' || t.id === networkZrxAddress) || {};
  const wethToken = tokens.find(t => t.symbol === 'WETH' || t.id === networkWethAddress) || {};

  if (!selectedToken && window.web3 && window.web3.utils.isAddress(token)) {
    try {
      const deployed = new window.web3.eth.Contract(EIP20.abi, token);
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
                'address': token,
              },
            },
          },
        },
      });
      const foundToken = responseUrlToken.data.find(t => t.id === token);

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
                address: token,
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
      yield put(uiActions.setUiState('bannerMessage', 'You are trading not listed token, please be aware of scam and double check the address'));
    } catch (e) {
      yield put(uiActions.showModal({
        title: "Couldn't find token by address",
        name: 'NoToken',
        type: 'warning',
      }));
      console.error(e);
    }
  }
  yield put(uiActions.setUiState('activeLink', 'home'));
  yield put(uiActions.setUiState('currentTokenId', selectedToken ? selectedToken.id : zrxToken.id));
  yield put(uiActions.setUiState('currentPairId', pairToken ? pairToken.id : wethToken.id));
}

function* checkNewToken({ payload: { pathname } }): Saga<void> {
  console.log(pathname);
  const tokens = yield select(getResourceMappedList('tokens', 'allTokens'));
  const reg = pathToRegexp('/:token-:pair');
  const [a, token, pair] = reg.exec(pathname) || []; // eslint-disable-line

  if (!pair && !token) {
    return;
  }

  const tokenItem = tokens.find(t => t.symbol === token || t.id === token) || {};
  const pairItem = tokens.find(t => t.symbol === pair || t.id === pair) || {};

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
