import {
  call,
  put,
  fork,
  select,
} from 'redux-saga/effects';
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
} from '../utils/web3';
import * as ProfileActions from '../actions/profile';

import {
  runLoadUser,
  listenCurrentTokenChange,
} from './profile';
import * as uiActions from '../actions/ui';
import * as resourcesActions from '../actions/resources';

export function* initialize() {
  const responseTokens = yield call(
    fetchResourcesRequest,
    {
      payload: {
        resourceName: 'tokens',
        withDeleted: false,
      },
    },
  );
  const { pathname } = yield select(getLocation);
  const reg = pathToRegexp('/:token-:pair');
  const [a, token, pair] = reg.exec(pathname); // eslint-disable-line
  const selectedToken =
    responseTokens.data.find(t => t.attributes.symbol === token) ||
    responseTokens.data.find(t => t.attributes.symbol === 'ZRX');
  const pairToken =
    responseTokens.data.find(t => t.attributes.symbol === pair) ||
    responseTokens.data.find(t => t.attributes.symbol === 'WETH');

  yield put(uiActions.setCurrentToken(selectedToken.id));
  yield put(uiActions.setCurrentPair(pairToken.id));

  yield put(
    resourcesActions.fetchResourcesRequest({
      resourceName: 'orders',
      withDeleted: false,
      fetchQuery: {
        filterCondition: {
          filter: {
            'token.id': {
              eq: selectedToken.id,
            },
          },
        },
      },
    }),
  );
  yield call(loadWeb3);
  if (!window.web3) {
    yield put(ProfileActions.setConnectionStatus(connectionStatuses.NOT_CONNECTED));
  } else {
    yield fork(runLoadUser);
    yield fork(listenCurrentTokenChange);
  }
}
