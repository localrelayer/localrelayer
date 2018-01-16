import { select, call, put } from 'redux-saga/effects';
import { delay } from 'redux-saga';
import promisify from 'es6-promisify';
import { getWeb3, getAddress, getBalance } from '../selectors';
import * as ProfileActions from '../actions/profile';

export function* loadUser() {
  const web3 = yield select(getWeb3);
  const account = yield select(getAddress);
  const oldBalance = yield select(getBalance);
  // console.log('old', account, oldBalance);
  const accounts = yield call(promisify(web3.eth.getAccounts));
  if (accounts.length) {
    const balance = yield call(promisify(web3.eth.getBalance), accounts[0]);

    if (account !== accounts[0]) {
      yield put(ProfileActions.setAddress({ address: accounts[0] }));
      yield put(
        ProfileActions.setBalance({
          balance: web3.fromWei(balance.toString(), 'ether'),
        }),
      );
    }
  } else {
    // TODO: better notify that metamask is locked
    console.warn('Unlock metamask');
  }
}

export function* runLoadUser() {
  while (true) {
    yield call(loadUser);
    yield call(delay, 2000);
  }
}
