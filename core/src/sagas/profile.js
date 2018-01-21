import {
  select,
  call,
  put,
  all,
} from 'redux-saga/effects';
import abi from 'human-standard-token-abi';
import promisify from 'es6-promisify';
import {
  delay,
} from 'redux-saga';
import {
  getAddress,
  getTokens,
} from '../selectors';
import { promote } from '../utils';
import {
  getNetworkById,
  connectionStatuses,
} from '../utils/web3';
import * as ProfileActions from '../actions/profile';


export function* loadUser() {
  const { web3 } = window;
  const prevAccount = yield select(getAddress);
  const tokens = yield select(getTokens);
  const accounts = yield call(promisify(web3.eth.getAccounts));
  const newAccount = accounts[0];
  if (prevAccount !== newAccount) {
    if (!accounts.length) {
      yield put(ProfileActions.setConnectionStatus(connectionStatuses.LOCKED));
    } else {
      yield put(ProfileActions.setConnectionStatus(connectionStatuses.CONNECTED));

      const balance = accounts[0] ? yield call(promisify(web3.eth.getBalance), accounts[0]) : '0';
      const formattedBalance = web3.fromWei(balance.toString(), 'ether').toString();
      yield put(ProfileActions.setAddress({ address: accounts[0] }));
      yield put(
        ProfileActions.setBalance({
          balance: formattedBalance,
        }),
      );
      const networkId = yield call(promisify(web3.version.getNetwork));
      const network = getNetworkById(networkId);
      yield put(ProfileActions.setCurrentNetwork(network));
      const balances = yield all(tokens.map(getTokenBalances));
      const userTokens = balances.map((b, i) => ({
        name: tokens[i].name,
        symbol: tokens[i].symbol,
        address: tokens[i].address,
        balance: b.shift(-tokens[i].decimals).toString(),
      })).filter(token => token.symbol === 'WETH' || +token.balance);
      yield put(ProfileActions.setTokens(promote('symbol', 'WETH', userTokens)));
    }
  }
}

export function* runLoadUser() {
  while (true) {
    yield call(loadUser);
    yield call(delay, 2000);
  }
}

function* getTokenBalances(token) {
  const account = yield select(getAddress);
  const tokenInst = window.web3.eth.contract(abi).at(token.address);
  const tokenBalance = yield call(promisify(tokenInst.balanceOf.call), account);
  return tokenBalance;
}
