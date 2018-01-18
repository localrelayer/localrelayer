import {
  select,
  call,
  put,
} from 'redux-saga/effects';
import {
  delay,
} from 'redux-saga';
import promisify from 'es6-promisify';

import {
  getWeb3,
  getAddress,
} from '../selectors';
import {
  getNetworkById,
  connectionStatuses,
} from '../utils/web3';
import * as ProfileActions from '../actions/profile';


export function* loadUser() {
  const web3 = yield select(getWeb3);
  const account = yield select(getAddress);
  const accounts = yield call(promisify(web3.eth.getAccounts));
  if (account !== accounts[0]) {
    if (!accounts.length) {
      yield put(ProfileActions.setConnectionStatus(connectionStatuses.LOCKED));
    } else {
      yield put(ProfileActions.setConnectionStatus(connectionStatuses.CONNECTED));
    }

    const balance = accounts[0] ? yield call(promisify(web3.eth.getBalance), accounts[0]) : '0';

    yield put(ProfileActions.setAddress({ address: accounts[0] }));
    yield put(
      ProfileActions.setBalance({
        balance: web3
          .fromWei(balance, 'ether')
          .toFixed(6)
          .toString(),
      }),
    );

    const networkId = yield call(promisify(web3.version.getNetwork));
    const network = getNetworkById(networkId);
    yield put(ProfileActions.setCurrentNetwork(network));
  }
}

export function* runLoadUser() {
  while (true) {
    yield call(loadUser);
    yield call(delay, 2000);
  }
}
