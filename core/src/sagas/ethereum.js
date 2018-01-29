import {
  take,
  select,
  fork,
  put,
  call,
} from 'redux-saga/effects';
import { getFormValues, reset } from 'redux-form';
import { ZeroEx } from '0x.js';
import * as ProfileActions from '../actions/profile';
import * as actionTypes from '../actions/types';
import { sendNotification } from '../actions/ui';
import {
  getAddress,
  getBalance,
  getUserTokenBy,
} from '../selectors';

const sagas = {
  deposit,
  withdraw,
  setAllowance,
};

// Deposit WETH (wrap)
function* deposit() {
  const { zeroEx } = window;

  const weth = yield select(getUserTokenBy('symbol', 'WETH'));
  const { amount } = yield select(getFormValues('WrapForm'));
  const account = yield select(getAddress);
  const balance = yield select(getBalance);
  const ethToConvert = ZeroEx.toBaseUnitAmount(new BigNumber(amount), weth.decimals);
  try {
    yield call(() => zeroEx.etherToken.depositAsync(
      weth.address,
      ethToConvert,
      account,
      { gasLimit: 100000 },
    ));
    yield put(sendNotification({ message: 'Deposit successful', type: 'success' }));
  } catch (e) {
    yield put(sendNotification({ message: e.message, type: 'error' }));
    console.error(e);
    return;
  }
  const newTokenBalance = BigNumber(weth.balance).plus(amount);
  const newBalance = BigNumber(balance).minus(amount);
  yield put(reset('WrapForm'));
  yield put(ProfileActions.setBalance({ balance: newBalance.toString() }));
  yield put(ProfileActions.updateToken({
    tokenAddress: weth.address,
    field: 'balance',
    value: newTokenBalance.toString(),
  }));
}

// Withdraw WETH (unwrap)
function* withdraw() {
  const { zeroEx } = window;

  const weth = yield select(getUserTokenBy('symbol', 'WETH'));
  const { amount } = yield select(getFormValues('WrapForm'));
  const account = yield select(getAddress);
  const balance = yield select(getBalance);

  const ethToConvert = ZeroEx.toBaseUnitAmount(new BigNumber(amount), weth.decimals);
  try {
    yield call(() => zeroEx.etherToken.withdrawAsync(
      weth.address,
      ethToConvert,
      account,
      { gasLimit: 100000 },
    ));
    yield put(sendNotification({ message: 'Withdraw successful', type: 'success' }));
  } catch (e) {
    yield put(sendNotification({ message: e.message, type: 'error' }));
    console.error(e);
    return;
  }
  const newTokenBalance = BigNumber(weth.balance).minus(amount);
  const newBalance = BigNumber(balance).plus(amount);
  yield put(reset('WrapForm'));
  yield put(ProfileActions.setBalance({ balance: newBalance.toString() }));
  yield put(ProfileActions.updateToken({
    tokenAddress: weth.address,
    field: 'balance',
    value: newTokenBalance.toString(),
  }));
}

function* setAllowance({ payload }) {
  const { zeroEx } = window;
  const contractAddress = payload.token.address;
  const account = yield select(getAddress);
  try {
    yield call(() =>
      zeroEx.token.setUnlimitedProxyAllowanceAsync(
        contractAddress,
        account,
        { gasLimit: 100000 },
      ));
  } catch (e) {
    yield put(sendNotification({ message: e.message, type: 'error' }));
    console.error(e);
    return;
  }
  yield put(ProfileActions.updateToken({
    tokenAddress: contractAddress,
    field: 'isTradable',
    value: true,
  }));
}

export function* listenCallContract() {
  while (true) {
    const action = yield take(actionTypes.CALL_CONTRACT);
    yield fork(sagas[action.payload.method], action); // eslint-disable-line
  }
}
