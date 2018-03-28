// @flow
import {
  take,
  select,
  fork,
  put,
  call,
} from 'redux-saga/effects';
import {
  delay,
} from 'redux-saga';
import type { Saga } from 'redux-saga';
import BigNumber from 'bignumber.js';
import { getFormValues, reset } from 'redux-form';
import { ZeroEx } from '0x.js';
import * as ProfileActions from '../actions/profile';
import * as actionTypes from '../actions/types';
import {
  sendNotification,
  setUiState,
  showModal,
} from '../actions/ui';
import {
  loadTokensBalance,
  loadBalance,
} from './profile';
import {
  getAddress,
  getUserTokenBy,
  getBalance,
} from '../selectors';

const sagas = {
  deposit,
  withdraw,
  setAllowance,
  unsetAllowance,
};

// Deposit WETH (wrap)
function* deposit() {
  const { zeroEx } = window;

  const weth = yield select(getUserTokenBy('symbol', 'WETH'));
  const { amount } = yield select(getFormValues('WrapForm'));
  const account = yield select(getAddress);
  const balance = yield select(getBalance);

  if (balance === amount) {
    yield put(showModal({
      title: 'Do not deposit all of your ETH!',
      type: 'info',
      text: 'Otherwise you cannot pay for transactions.',
    }));
  } else {
    const ethToConvert = ZeroEx.toBaseUnitAmount(new BigNumber(amount), weth.decimals);
    try {
      const txHash = yield call([zeroEx.etherToken, zeroEx.etherToken.depositAsync],
        weth.id,
        ethToConvert,
        account,
        { gasLimit: 80000 });
      yield put(setUiState('isBalanceLoading', true));
      yield put(reset('WrapForm'));
      yield call([zeroEx, zeroEx.awaitTransactionMinedAsync], txHash);
      yield call(delay, 10000);
      yield put(sendNotification({ message: 'Deposit successful', type: 'success' }));
      yield call(loadTokensBalance);
      yield call(loadBalance);
      yield put(setUiState('isBalanceLoading', false));
    } catch (e) {
      yield put(sendNotification({ message: e.message, type: 'error' }));
      console.error(e);
    }
  }
}

// Withdraw WETH (unwrap)
function* withdraw() {
  const { zeroEx } = window;

  const weth = yield select(getUserTokenBy('symbol', 'WETH'));
  const { amount } = yield select(getFormValues('WrapForm'));
  const account = yield select(getAddress);

  const ethToConvert = ZeroEx.toBaseUnitAmount(new BigNumber(amount), weth.decimals);
  try {
    const txHash = yield call([zeroEx.etherToken, zeroEx.etherToken.withdrawAsync],
      weth.id,
      ethToConvert,
      account,
      { gasLimit: 80000 });
    yield put(setUiState('isBalanceLoading', true));
    yield put(reset('WrapForm'));
    yield call([zeroEx, zeroEx.awaitTransactionMinedAsync], txHash);
    yield call(delay, 10000);
    yield put(sendNotification({ message: 'Withdrawal successful', type: 'success' }));
    yield call(loadTokensBalance);
    yield call(loadBalance);
    yield put(setUiState('isBalanceLoading', false));
  } catch (e) {
    yield put(sendNotification({ message: e.message, type: 'error' }));
    console.error(e);
  }
}

function* setAllowance(token) {
  const { zeroEx } = window;
  const contractAddress = token.id;
  const account = yield select(getAddress);
  try {
    const txHash = yield call(
      [zeroEx.token, zeroEx.token.setUnlimitedProxyAllowanceAsync],
      contractAddress,
      account,
      { gasLimit: 80000 },
    );
    yield put(setUiState('isBalanceLoading', true));
    yield call([zeroEx, zeroEx.awaitTransactionMinedAsync], txHash);
    yield put(setUiState('isBalanceLoading', false));

    yield put(ProfileActions.updateToken({
      tokenAddress: contractAddress,
      field: 'isTradable',
      value: true,
    }));
  } catch (e) {
    yield put(sendNotification({ message: e.message, type: 'error' }));
    console.error(e);
  }
}

function* unsetAllowance(token) {
  const { zeroEx } = window;
  const contractAddress = token.id;
  const account = yield select(getAddress);
  try {
    const txHash = yield call(
      [zeroEx.token, zeroEx.token.setProxyAllowanceAsync],
      contractAddress,
      account,
      BigNumber(0),
      { gasLimit: 80000 },
    );
    yield put(setUiState('isBalanceLoading', true));
    yield call([zeroEx, zeroEx.awaitTransactionMinedAsync], txHash);
    yield put(setUiState('isBalanceLoading', false));

    yield put(ProfileActions.updateToken({
      tokenAddress: contractAddress,
      field: 'isTradable',
      value: false,
    }));
  } catch (e) {
    yield put(sendNotification({ message: e.message, type: 'error' }));
    console.error(e);
  }
}

export function* listenCallContract(): Saga<void> {
  while (true) {
    const action = yield take(actionTypes.CALL_CONTRACT);
    yield fork(sagas[action.meta.method], action.payload);
  }
}
