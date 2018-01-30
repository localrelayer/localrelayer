import {
  select,
  call,
  put,
  cps,
  takeEvery,
} from 'redux-saga/effects';
import {
  delay,
} from 'redux-saga';
import {
  uniqBy,
} from 'ramda';
import * as types from '../actions/types';
import {
  getAddress,
  getTokens,
  getCurrentToken,
  getCurrentPair,
} from '../selectors';
import {
  getNetworkById,
  connectionStatuses,
} from '../utils/web3';
import * as ProfileActions from '../actions/profile';

export function* loadUser() {
  const { web3 } = window;
  const prevAccount = yield select(getAddress);
  const accounts = yield cps(web3.eth.getAccounts);
  const newAccount = accounts[0];
  if (prevAccount !== newAccount) {
    if (!accounts.length) {
      yield put(ProfileActions.setConnectionStatus(connectionStatuses.LOCKED));
    } else {
      yield put(ProfileActions.setConnectionStatus(connectionStatuses.CONNECTED));

      const balance = yield cps(web3.eth.getBalance, accounts[0]);
      const formattedBalance = web3.fromWei(balance, 'ether').toFixed(8).toString();
      yield put(ProfileActions.setAddress({ address: accounts[0] }));
      yield put(
        ProfileActions.setBalance({
          balance: formattedBalance,
        }),
      );
      yield call(loadNetwork);
      yield call(loadTokensBalance);
    }
  }
}

export function* loadTokensBalance() {
  const account = yield select(getAddress);
  if (!account) return;
  const currentToken = yield select(getCurrentToken);
  const currentPair = yield select(getCurrentPair);
  const pair = yield getTokenBalanceAndAllowance(currentPair.symbol);
  const zrx = yield getTokenBalanceAndAllowance('ZRX');

  const current = yield getTokenBalanceAndAllowance(currentToken.symbol);
  const uniqTokens = uniqBy(a => a.symbol, [pair, zrx, current]);
  yield put(ProfileActions.setTokens(uniqTokens));
}

export function* loadNetwork() {
  const { web3 } = window;
  const networkId = yield cps(web3.version.getNetwork);
  const network = getNetworkById(networkId);
  yield put(ProfileActions.setCurrentNetwork(network));
}

export function* runLoadUser() {
  while (true) {
    yield call(loadUser);
    yield call(delay, 2000);
  }
}

export function* listenCurrentTokenChange() {
  yield takeEvery(types.SET_CURRENT_TOKEN, loadTokensBalance);
}


function* getTokenBalanceAndAllowance(tokenSymbol) {
  const { zeroEx } = window;

  const tokens = yield select(getTokens);
  const token = tokens.find(t => t.symbol === tokenSymbol);
  const account = yield select(getAddress);

  const tokenBalance = yield call(
    [zeroEx.token, zeroEx.token.getBalanceAsync],
    token.address,
    account,
  );
  const allowance = yield call(
    [zeroEx.token, zeroEx.token.getProxyAllowanceAsync],
    token.address,
    account,
  );
  return {
    ...token,
    isTradable: allowance.gt(0),
    balance: (tokenBalance.dividedBy(BigNumber(10).toPower(token.decimals))).toString(),
  };
}
