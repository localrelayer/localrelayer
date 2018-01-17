import { call, put, fork } from 'redux-saga/effects';

import { fetchResourcesRequest } from '../actions';
import { loadWeb3, connectionStatuses } from '../utils/web3';
import * as EthereumActions from '../actions/ethereum';
import * as ProfileActions from '../actions/profile';
import { runLoadUser } from './profile';

export function* initialize() {
  yield put(
    fetchResourcesRequest({
      resourceName: 'tokens',
      withDeleted: false,
    }),
  );

  const web3 = yield call(loadWeb3);

  if (!web3) {
    yield put(ProfileActions.setConnectionStatus(connectionStatuses.NOT_CONNECTED));
  } else {
    yield put(EthereumActions.setWeb3(web3));
    yield fork(runLoadUser);
  }
}
