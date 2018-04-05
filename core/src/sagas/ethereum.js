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
import createActionCreators from 'redux-resource-action-creators';
import type { Saga } from 'redux-saga';
import BigNumber from 'bignumber.js';
import { getFormValues, reset } from 'redux-form';
import { ZeroEx } from '0x.js';
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
  getBalance,
  getWethToken,
} from '../selectors';
import {
  trackMixpanel,
} from '../utils/mixpanel';

const sagas = {
  deposit,
  withdraw,
  setAllowance,
  unsetAllowance,
};

// Deposit WETH (wrap)
function* deposit() {
  const { zeroEx } = window;

  const weth = yield select(getWethToken);
  const { amount } = yield select(getFormValues('WrapForm'));
  const account = yield select(getAddress);
  const balance = yield select(getBalance);

  if (balance <= 0.0001) {
    yield put(showModal({
      title: 'Do not deposit all of your ETH!',
      type: 'info',
      text: 'You need to pay for deposit transactions.',
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

      // Somewhy balance isn't updated until 10 seconds will end
      yield call(delay, 10000);

      trackMixpanel(
        'Deposit',
        { address: account },
      );

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

  const weth = yield select(getWethToken);
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

    // Somewhy balance isn't updated until 10 seconds will end
    yield call(delay, 10000);

    trackMixpanel(
      'Withdraw',
      { address: account },
    );

    yield put(sendNotification({ message: 'Withdrawal successful', type: 'success' }));
    yield call(loadTokensBalance);
    yield call(loadBalance);
    yield put(setUiState('isBalanceLoading', false));
  } catch (e) {
    yield put(sendNotification({ message: e.message, type: 'error' }));
    yield put(setUiState('isBalanceLoading', false));

    console.error(e);
  }
}

function* setAllowance(token) {
  const { zeroEx } = window;
  // const  = yield select(getResourceItemBydId('tokens', token.id));
  const account = yield select(getAddress);
  try {
    const actions = createActionCreators('update', {
      resourceName: 'tokens',
      request: 'unlockToken',
      lists: ['allTokens', 'currentUserTokens'],
    });
    const txHash = yield call(
      [zeroEx.token, zeroEx.token.setUnlimitedProxyAllowanceAsync],
      token.id,
      account,
      { gasLimit: 80000 },
    );
    yield put(setUiState('isBalanceLoading', true));
    yield call([zeroEx, zeroEx.awaitTransactionMinedAsync], txHash);
    yield put(setUiState('isBalanceLoading', false));

    trackMixpanel(
      'Allowance setted',
      { address: account, token: token.id },
    );

    yield put(actions.succeeded({
      resources: [{
        id: token.id,
        attributes: {
          ...token,
          isTradable: true,
        },
      }],
    }));
  } catch (e) {
    yield put(sendNotification({ message: e.message, type: 'error' }));
    yield put(setUiState('isBalanceLoading', false));

    console.error(e);
  }
}

function* unsetAllowance(token) {
  const { zeroEx } = window;
  const account = yield select(getAddress);
  try {
    const actions = createActionCreators('update', {
      resourceName: 'tokens',
      request: 'unlockToken',
      lists: ['allTokens', 'currentUserTokens'],
    });
    const txHash = yield call(
      [zeroEx.token, zeroEx.token.setProxyAllowanceAsync],
      token.id,
      account,
      BigNumber(0),
      { gasLimit: 80000 },
    );
    yield put(setUiState('isBalanceLoading', true));
    yield call([zeroEx, zeroEx.awaitTransactionMinedAsync], txHash);
    yield put(setUiState('isBalanceLoading', false));

    trackMixpanel(
      'Allowance unsetted',
      { address: account, token: token.id },
    );

    yield put(actions.succeeded({
      resources: [{
        id: token.id,
        attributes: {
          ...token,
          isTradable: false,
        },
      }],
    }));
  } catch (e) {
    yield put(sendNotification({ message: e.message, type: 'error' }));
    yield put(setUiState('isBalanceLoading', false));
    console.error(e);
  }
}

export function* listenCallContract(): Saga<void> {
  while (true) {
    const action = yield take(actionTypes.CALL_CONTRACT);
    yield fork(sagas[action.meta.method], action.payload);
  }
}
