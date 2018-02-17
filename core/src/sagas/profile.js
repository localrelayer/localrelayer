import {
  select,
  call,
  put,
  cps,
  takeLatest,
} from 'redux-saga/effects';
import {
  delay,
} from 'redux-saga';
import type { Saga } from 'redux-saga';
import {
  push,
} from 'react-router-redux';
import {
  getAddress,
  getCurrentToken,
  getCurrentPair,
} from '../selectors';
import {
  getNetworkById,
  connectionStatuses,
} from '../utils/web3';
import {
  loadOrders,
} from './orders';
import {
  setProfileState,
} from '../actions/profile';
import * as resourcesActions from '../actions/resources';


export function* loadUser(): Saga<*> {
  const { web3 } = window;
  const prevAccount = yield select(getAddress);
  const accounts = yield cps(web3.eth.getAccounts);
  const newAccount = accounts[0];
  if (prevAccount !== newAccount) {
    yield put(setProfileState('address', newAccount));
    if (!accounts.length) {
      yield put(setProfileState('connectionStatus', connectionStatuses.LOCKED));
    } else {
      yield put(setProfileState('connectionStatus', connectionStatuses.CONNECTED));

      yield call(loadBalance);
      yield call(loadNetwork);
      yield call(loadTokensBalance);
      yield call(loadUserOrders);
    }
  }
}

export function* loadBalance(): Saga<*> {
  const { web3 } = window;
  const account = yield select(getAddress);
  const balance = yield cps(web3.eth.getBalance, account);
  const formattedBalance = web3.fromWei(balance, 'ether').toFixed(8).toString();
  yield put(
    setProfileState('balance', formattedBalance),
  );
}

export function* loadTokensBalance() {
  const currentToken = yield select(getCurrentToken);
  const currentPair = yield select(getCurrentPair);
  const pair = yield getTokenBalanceAndAllowance(currentPair);
  const current = yield getTokenBalanceAndAllowance(currentToken);
  yield put(setProfileState('tokens', [pair, current]));
}

export function* loadNetwork() {
  const { web3 } = window;
  const networkId = yield cps(web3.version.getNetwork);
  const network = getNetworkById(networkId);
  yield put(setProfileState('network', network));
}

export function* changeToken() {
  const currentToken = yield select(getCurrentToken);
  const currentPair = yield select(getCurrentPair);
  yield put(push(`${currentToken.symbol}-${currentPair.symbol}`));
  yield call(loadTokensBalance);
  yield call(loadOrders);
}

export function* listenCurrentTokenChange() {
  yield takeLatest(action =>
    action.payload && (
      action.payload.key === 'currentTokenId' ||
      action.payload.key === 'currentPairId'
    ),
  changeToken);
}


function* getTokenBalanceAndAllowance(token) {
  const { zeroEx } = window;
  const account = yield select(getAddress);
  const tokenBalance = yield call(
    [zeroEx.token, zeroEx.token.getBalanceAsync],
    token.id,
    account,
  );
  const allowance = yield call(
    [zeroEx.token, zeroEx.token.getProxyAllowanceAsync],
    token.id,
    account,
  );
  return {
    ...token,
    isTradable: allowance.gt(0),
    balance: (tokenBalance.dividedBy(BigNumber(10).toPower(token.decimals))).toString(),
  };
}

export function* loadUserOrders() {
  const account = yield select(getAddress);
  yield put(
    resourcesActions.fetchResourcesRequest({
      resourceName: 'orders',
      list: 'userOrders',
      request: 'fetchOrders',
      withDeleted: false,
      mergeListIds: false,
      fetchQuery: {
        filterCondition: {
          filter: {
            'completed_at': null,
            'child_id': null,
            'canceled_at': null,
            'deleted_at': null,
            'maker_address': account,
          },
        },
        sortBy: '-created_at',
      },
    }),
  );
}

export function* runLoadUser(): Saga<*> {
  while (true) {
    yield call(loadUser);
    yield call(delay, 2000);
  }
}
