import { call, put } from 'redux-saga/effects';
import { loadWeb3 } from '../utils/web3';
import * as EthereumActions from '../actions/ethereum';
import { runLoadUser } from './profile';

export function* initialize() {
  const web3 = yield call(loadWeb3);
  yield put(EthereumActions.setWeb3(web3));
  yield call(runLoadUser);
}
