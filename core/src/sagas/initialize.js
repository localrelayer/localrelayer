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
import * as EthereumActions from '../actions/ethereum';
import * as ProfileActions from '../actions/profile';
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
  yield put(uiActions.setCurrentToken(responseTokens.data[0].id));
  yield put(
    resourcesActions.fetchResourcesRequest({
      resourceName: 'orders',
      withDeleted: false,
    }),
  );

  const web3 = yield call(loadWeb3);

  if (!web3) {
    yield put(ProfileActions.setConnectionStatus(connectionStatuses.NOT_CONNECTED));
  } else {
    yield put(EthereumActions.setWeb3(web3));
    yield fork(ProfileActions.runLoadUser);
  }
}
