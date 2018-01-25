import {
  select,
  call,
  put,
  all,
  cps,
  takeEvery,
} from 'redux-saga/effects';
import abi from 'human-standard-token-abi';
import {
  delay,
} from 'redux-saga';
import BN from 'bignumber.js';
import * as types from '../actions/types';
import {
  getAddress,
  getTokens,
  getCurrentToken,
} from '../selectors';
import { promote } from '../utils';
import {
  getNetworkById,
  connectionStatuses,
  contracts,
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

      const balance = accounts[0] ? yield cps(web3.eth.getBalance, accounts[0]) : '0';
      const formattedBalance = web3.fromWei(balance, 'ether').toFixed(8).toString();
      yield put(ProfileActions.setAddress({ address: accounts[0] }));
      yield put(
        ProfileActions.setBalance({
          balance: formattedBalance,
        }),
      );
      yield call(loadNetwork);
      yield call(loadTokenBalance);
    }
  }
}

export function* loadTokenBalance() {
  const tokens = yield select(getTokens);
  const currentToken = yield select(getCurrentToken);
  const tokensToLoad = tokens.filter(token =>
    token.symbol === 'WETH' ||
    token.symbol === 'ZRX' ||
    token.symbol === currentToken.symbol);
  const resp = yield all(tokensToLoad.map(getTokenBalances));
  const userTokens = resp.map(({ tokenBalance, allowance }, i) => ({
    name: tokensToLoad[i].name,
    symbol: tokensToLoad[i].symbol,
    address: tokensToLoad[i].address,
    balance: (tokenBalance.dividedBy(BN(10).toPower(tokensToLoad[i].decimals))).toString(),
    decimals: tokensToLoad[i].decimals,
    isTradable: allowance.gt(0),
  }));
  const promotedTokens = promote('symbol', 'WETH', promote('symbol', 'WETH', userTokens));
  yield put(ProfileActions.setTokens(promotedTokens));
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
  yield takeEvery(types.SET_CURRENT_TOKEN, loadTokenBalance);
}


function* getTokenBalances(token) {
  const { web3 } = window;
  const account = yield select(getAddress);
  const tokenInst = web3.eth.contract(abi).at(token.address);
  const tokenBalance = yield cps(tokenInst.balanceOf.call, account);
  const allowance = yield cps(tokenInst.allowance.call, account, contracts.proxy);
  return { tokenBalance, allowance };
}
