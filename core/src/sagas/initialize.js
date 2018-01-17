import {
  call,
  put,
} from 'redux-saga/effects';

import {
  loadWeb3,
} from '../utils/web3';
import {
  runLoadUser,
} from './profile';
import * as EthereumActions from '../actions/ethereum';
import {
  fetchResourcesRequest,
} from '../actions';


export function* initialize() {
  yield put(fetchResourcesRequest({
    resourceName: 'tokens',
    withDeleted: false,
  }));
  /*
  const web3 = yield call(loadWeb3);
  yield put(EthereumActions.setWeb3(web3));
  yield call(runLoadUser);
  */
}
