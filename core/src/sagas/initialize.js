import {
  call,
  put,
  fork,
} from 'redux-saga/effects';
import {
  fetchResourcesRequest,
} from './resources';
import {
  loadWeb3,
  connectionStatuses,
} from '../utils/web3';
import * as ProfileActions from '../actions/profile';

import { runLoadUser } from './profile';
import * as uiActions from '../actions/ui';
import * as resourcesActions from '../actions/resources';


export function* initialize() {
  yield call(loadWeb3);
  if (!window.web3) {
    yield put(ProfileActions.setConnectionStatus(
      connectionStatuses.NOT_CONNECTED,
    ));
  } else {
    yield fork(runLoadUser);
  }
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
  const wethToken = responseTokens.data.find(
    token => token.attributes.symbol === 'WETH',
  );
  const zrxToken = responseTokens.data.find(
    token => token.attributes.symbol === 'ZRX',
  );
  yield put(uiActions.setCurrentToken(zrxToken.id));
  yield put(uiActions.setCurrentPair(wethToken.id));
  yield put(
    resourcesActions.fetchResourcesRequest({
      resourceName: 'orders',
      list: 'currentOrders',
      request: 'fetchOrders',
      withDeleted: false,
      fetchQuery: {
        filterCondition: {
          filter: {
            'token.address': {
              eq: zrxToken.id,
            },
          },
        },
      },
    }),
  );
}
