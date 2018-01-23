import {
  select,
  call,
  put,
  all,
  cps,
} from 'redux-saga/effects';
import abi from 'human-standard-token-abi';
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
  contracts,
} from '../utils/web3';
import * as ProfileActions from '../actions/profile';


export function* loadUser() {
  const { web3 } = window;
  const prevAccount = yield select(getAddress);
  const tokens = yield select(getTokens);
  const accounts = yield cps(web3.eth.getAccounts);
  const newAccount = accounts[0];
  if (prevAccount !== newAccount) {
    if (!accounts.length) {
      yield put(ProfileActions.setConnectionStatus(connectionStatuses.LOCKED));
    } else {
      yield put(ProfileActions.setConnectionStatus(connectionStatuses.CONNECTED));

      const balance = accounts[0] ? yield cps(web3.eth.getBalance, accounts[0]) : '0';
      const formattedBalance = web3.fromWei(balance.toString(), 'ether').toString();
      yield put(ProfileActions.setAddress({ address: accounts[0] }));
      yield put(
        ProfileActions.setBalance({
          balance: formattedBalance,
        }),
      );
      const networkId = yield cps(web3.version.getNetwork);
      const network = getNetworkById(networkId);
      yield put(ProfileActions.setCurrentNetwork(network));
      const resp = yield all(tokens.map(getTokenBalances));
      const userTokens = resp.map(({ tokenBalance, allowance }, i) => ({
        name: tokens[i].name,
        symbol: tokens[i].symbol,
        address: tokens[i].address,
        balance: tokenBalance.shift(-tokens[i].decimals).toString(),
        decimals: tokens[i].decimals,
        isTradable: allowance.gt(0),
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
  const tokenBalance = yield cps(tokenInst.balanceOf.call, account);
  const allowance = yield cps(tokenInst.allowance.call, account, contracts.proxy);
  return { tokenBalance, allowance };
}
