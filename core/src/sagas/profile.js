import {
  select,
  call,
  put,
  cps,
  fork,
  all,
} from 'redux-saga/effects';
import {
  delay,
} from 'redux-saga';
import {
  ZeroEx,
} from '0x.js';
import type {
  Saga,
} from 'redux-saga';


import {
  socketConnect,
  handleSocketIO,
} from './socket';
import {
  getAddress,
  getCurrentToken,
  getCurrentPair,
  getProfileState,
  getLockedTokenBalance,
  getLockedPairBalance,
  getResourceMappedList,
} from '../selectors';
import {
  getNetworkById,
  connectionStatuses,
} from '../utils/web3';
import * as resourcesActions from '../actions/resources';
import {
  showModal,
  sendSocketMessage,
  setProfileState,
} from '../actions';


export function* loadUser(): Saga<*> {
  const {
    web3,
  } = window;
  const prevAccount = yield select(getAddress);
  const accounts = yield cps(web3.eth.getAccounts);
  const newAccount = accounts[0];
  const socketConnected = yield select(getProfileState('socketConnected'));
  if (prevAccount !== newAccount) {
    yield put(setProfileState('address', newAccount));
    if (!accounts.length) {
      yield put(setProfileState('connectionStatus', connectionStatuses.LOCKED));
      yield put(showModal({
        title: 'Your Metamask account is locked',
        type: 'warn',
        text: 'Please unlock it to interact with exchange',
      }));
    } else {
      yield put(setProfileState('connectionStatus', connectionStatuses.CONNECTED));

      yield all([
        call(loadBalance),
        call(loadNetwork),
        call(loadUserOrders),
      ]);
      // We need to access user orders, so we wait for it
      yield call(loadTokensBalance);
      if (!socketConnected) {
        const socket = yield call(socketConnect);
        yield fork(handleSocketIO, socket);
        yield put(setProfileState('socketConnected', true));
      }
      yield put(sendSocketMessage('login', {
        address: newAccount,
      }));
    }
  }
}

export function* loadBalance(): Saga<*> {
  const { web3 } = window;
  const account = yield select(getAddress);
  const balance = yield cps(web3.eth.getBalance, account);
  const formattedBalance = web3.utils.fromWei(balance, 'ether');
  yield put(
    setProfileState('balance', BigNumber(formattedBalance).toFixed(8).toString()),
  );
}

export function* loadTokensBalance() {
  const tokens = yield select(getResourceMappedList('tokens', 'allTokens'));

  const currentToken = yield select(getCurrentToken);
  const currentPair = yield select(getCurrentPair);

  const lockedToken = yield select(getLockedTokenBalance(currentToken));
  const lockedPair = yield select(getLockedPairBalance);
  // We need to substract order in orders amount
  const current = yield getTokenBalanceAndAllowance(currentToken, lockedToken);
  const pair = yield getTokenBalanceAndAllowance(currentPair, lockedPair);

  const allTokens = yield all(tokens
    .filter(token => token.id !== currentToken.id && token.id !== currentPair.id)
    .map(function* (token) {
      const locked = yield select(getLockedTokenBalance(token));
      const res = yield getTokenBalanceAndAllowance(token, locked);
      return res;
    }));
  yield put(setProfileState('tokens', [pair, current, ...allTokens]));
  yield put(setProfileState('currentTokens', [pair, current]));
}

export function* loadNetwork() {
  const { web3 } = window;
  const networkId = yield cps(web3.eth.net.getId);
  const network = getNetworkById(networkId);
  yield put(setProfileState('network', network));
}

function* getTokenBalanceAndAllowance(token, locked) {
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
    fullBalance: ZeroEx.toUnitAmount(tokenBalance, token.decimals).toFixed(6),
    balance: ZeroEx.toUnitAmount(tokenBalance, token.decimals).minus(locked).toFixed(6),
  };
}

export function* loadUserOrders() {
  const account = yield select(getAddress);
  yield put(
    resourcesActions.fetchResourcesRequest({
      resourceName: 'orders',
      list: 'userOrders',
      request: 'fetchUserOrders',
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

  yield put(
    resourcesActions.fetchResourcesRequest({
      resourceName: 'orders',
      list: 'completedUserOrders',
      request: 'fetchUserOrders',
      withDeleted: false,
      mergeListIds: false,
      fetchQuery: {
        filterCondition: {
          filter: {
            'deleted_at': null,
            'maker_address': account,
            'child_id': null,
            'status': {
              'ne': 'new',
            },
          },
        },
        sortBy: '-created_at',
      },
    }),
  );
}

export function* runLoadUser(): Saga<*> {
  while (true) {
    yield fork(loadUser);
    yield call(delay, 3000);
  }
}
