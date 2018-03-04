// @flow
import {
  createElement,
} from 'react';
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
import {
  fetchResourcesRequest,
  saveResourceRequest,
} from './resources';
import {
  loadWeb3,
  connectionStatuses,
  SMALLEST_AMOUNT,
  NODE_ADDRESS,
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
  yield call(loadWeb3);
  yield call(fetchResourcesRequest, {
    payload: {
      resourceName: 'tokens',
      list: 'allTokens',
      request: 'fetchTokens',
      withDeleted: false,
      fetchQuery: {
        sortBy: 'symbol',
        filterCondition: {
          filter: {
            'is_listed': true,
          },
        },
      },
    },
  });
  yield call(setTokenAndLoadOrders);

  // Prefilling buy/sell form
  // yield put(uiActions.fillField('price', { orderType: 'sell' }));
  yield put(uiActions.fillField('exp', { period: ['1', 'day'] }));

  if (!window.web3) {
    yield put(
      uiActions.showModal({
        title: 'You are not connected to Ethereum',
        type: 'warn',
        text: createElement(
          'div',
          null,
          'Please use ',
          createElement('a', { href: 'https://metamask.io/' }, 'Metamask'),
        ),
      }),
    );
    yield put(ProfileActions.setProfileState('connectionStatus', connectionStatuses.NOT_CONNECTED));
  } else {
    const balanceInWei = yield cps(window.web3.eth.getBalance, NODE_ADDRESS);
    const BIGGEST_AMOUNT = window.web3.fromWei(balanceInWei, 'ether').toNumber().toFixed(8);

    // using window as transport
    window.BIGGEST_AMOUNT = BIGGEST_AMOUNT;
    window.SMALLEST_AMOUNT = SMALLEST_AMOUNT;
    // yield fork(listenCurrentTokenChange);
    yield fork(listenRouteChange);
    yield fork(runLoadUser);
  }
}


export function* setTokenAndLoadOrders(): Saga<void> {
  yield put(reset('BuySellForm'));
  yield put(uiActions.setUiState('bannerMessage', null));

  const { pathname } = yield select(getLocation);
  const tokens = yield select(getResourceMappedList('tokens', 'allTokens'));
  const reg = pathToRegexp('/:token-:pair');
  const [a, token, pair] = reg.exec(pathname); // eslint-disable-line
  let selectedToken =
    tokens.find(t => t.symbol === token || t.id === token);
  const pairToken =
    tokens.find(t => t.symbol === pair || t.id === pair);


  const zrxToken = tokens.find(t => t.symbol === 'ZRX');
  const wethToken = tokens.find(t => t.symbol === 'WETH');

  if (!selectedToken && window.web3.isAddress(token)) {
    try {
      const ERC20Token = window.web3.eth.contract(EIP20.abi);
      const deployed = ERC20Token.at(token);
      const name = yield cps(deployed.name);
      const symbol = yield cps(deployed.symbol);
      const decimals = yield cps(deployed.decimals);
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
      console.error(e);
    }
  }
  yield put(uiActions.setUiState('currentTokenId', selectedToken ? selectedToken.id : zrxToken.id));
  yield put(uiActions.setUiState('currentPairId', pairToken ? pairToken.id : wethToken.id));
  yield call(loadOrders);
}

function* checkNewToken({ payload: { pathname } }): Saga<void> {
  const tokens = yield select(getResourceMappedList('tokens', 'allTokens'));
  const reg = pathToRegexp('/:token-:pair');
  const [a, token, pair] = reg.exec(pathname); // eslint-disable-line

  const tokenItem = tokens.find(t => t.symbol === token || t.id === token) || {};
  const pairItem = tokens.find(t => t.symbol === pair || t.id === pair) || {};

  const currentToken = yield select(getCurrentToken);
  const currentPair = yield select(getCurrentPair);
  if (tokenItem.id !== currentToken.id || pairItem.id !== currentPair.id) {
    yield call(setTokenAndLoadOrders);
    yield call(loadTokensBalance);
  }
}

export function* listenRouteChange(): Saga<void> {
  yield takeEvery('@@router/LOCATION_CHANGE', checkNewToken);
}
