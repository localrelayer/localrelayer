import {
  take,
  select,
  call,
  fork,
  put,
} from 'redux-saga/effects';
import promisify from 'es6-promisify';
import { getFormValues, reset } from 'redux-form';
import BigNumber from 'bignumber.js';
import * as ProfileActions from '../actions/profile';
import abi from '../contracts/EtherToken.json';
import * as actionTypes from '../actions/types';
import { contracts } from '../utils/web3';
import {
  getAddress,
  getBalance,
  getUserToken,
} from '../selectors';

export function* WETH({ payload }) {
  const { web3 } = window;
  const contractAddress = contracts[payload.contract];

  const { amount } = yield select(getFormValues('WrapForm'));
  const account = yield select(getAddress);
  const balance = yield select(getBalance);
  const token = yield select(getUserToken(contractAddress));

  const contractInst = web3.eth.contract(abi).at(contractAddress);
  // eslint-disable-next-line
  const { newBalance, newTokenBalance } = yield call(eval(payload.method), {
    amount,
    contractInst,
    account,
    web3,
    balance,
    token,
  });
  console.log(newBalance, newTokenBalance);
  yield put(reset('WrapForm'));
  yield put(ProfileActions.setBalance({ balance: newBalance.toString() }));
  yield put(ProfileActions.updateToken({
    tokenAddress: contractAddress,
    field: 'balance',
    value: newTokenBalance.toString(),
  }));
}

// Deposit WETH (wrap)
export function* deposit({
  amount,
  contractInst,
  account,
  web3,
  balance,
  token,
}) {
  yield call(promisify(contractInst.deposit), {
    value: web3.toWei(amount),
    from: account,
    gas: 100000,
  });
  const newTokenBalance = BigNumber(token.balance).plus(amount);
  const newBalance = BigNumber(balance).minus(amount);
  return { newTokenBalance, newBalance };
}

// Withdraw WETH (unwrap)
export function* withdraw({
  amount,
  contractInst,
  account,
  web3,
  balance,
  token,
}) {
  yield call(
    promisify(contractInst.withdraw),
    web3.toWei(amount), {
      from: account,
      gas: 100000,
    },
  );
  const newTokenBalance = BigNumber(token.balance).minus(amount);
  const newBalance = BigNumber(balance).plus(amount);
  return { newTokenBalance, newBalance };
}

export function* watchCallContract() {
  while (true) {
    const action = yield take(actionTypes.CALL_CONTRACT);
    yield fork(eval(action.payload.contract), action); // eslint-disable-line
  }
}
