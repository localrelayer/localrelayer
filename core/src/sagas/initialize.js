// @flow
import {
  call,
  put,
  fork,
  select,
  cps,
} from 'redux-saga/effects';
import type {
  Saga,
} from 'redux-saga';
import {
  getLocation,
} from 'react-router-redux';
import pathToRegexp from 'path-to-regexp';
import {
  fetchResourcesRequest,
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
  listenCurrentTokenChange,
} from './profile';
import {
  loadOrders,
} from './orders';
import * as uiActions from '../actions/ui';

export function* initialize(): Saga<void> {
  const responseTokens = yield call(
    fetchResourcesRequest,
    {
      payload: {
        resourceName: 'tokens',
        list: 'allTokens',
        request: 'fetchTokens',
        withDeleted: false,
        fetchQuery: {
          sortBy: 'symbol',
        },
      },
    },
  );
  const {
    pathname,
  } = yield select(getLocation);
  const reg = pathToRegexp('/:token-:pair');
  const [a, token, pair] = reg.exec(pathname); // eslint-disable-line
  const selectedToken =
    responseTokens.data.find(t => t.attributes.symbol === token) ||
    responseTokens.data.find(t => t.attributes.symbol === 'ZRX');
  const pairToken =
    responseTokens.data.find(t => t.attributes.symbol === pair) ||
    responseTokens.data.find(t => t.attributes.symbol === 'WETH');
  yield put(uiActions.setUiState('currentTokenId', selectedToken.id));
  yield put(uiActions.setUiState('currentPairId', pairToken.id));

  yield call(loadOrders);
  yield call(loadWeb3);

  // Prefilling buy/sell form
  yield put(uiActions.fillField('price', { orderType: 'sell' }));
  yield put(uiActions.fillField('exp', { period: ['1', 'day'] }));

  const balanceInWei = yield cps(window.web3.eth.getBalance, NODE_ADDRESS);
  const BIGGEST_AMOUNT = window.web3.fromWei(balanceInWei, 'ether').toNumber();

  // using window as transport
  window.BIGGEST_AMOUNT = BIGGEST_AMOUNT;
  window.SMALLEST_AMOUNT = SMALLEST_AMOUNT;

  if (!window.web3) {
    yield put(ProfileActions.setProfileState('connectionStatus', connectionStatuses.NOT_CONNECTED));
  } else {
    yield fork(runLoadUser);
    yield fork(listenCurrentTokenChange);
  }
}
