import {
  select,
  call,
  put,
  cps,
  fork,
  all,
  takeEvery,
} from 'redux-saga/effects';
import {
  delay,
} from 'redux-saga';
import {
  ZeroEx,
} from '0x.js';
import createActionCreators from 'redux-resource-action-creators';
import type {
  Saga,
} from 'redux-saga';
import {
  equals,
} from 'ramda';
import {
  trackMixpanel,
} from '../utils/mixpanel';
import * as types from '../actions/types';
import {
  socketConnect,
  handleSocketIO,
} from './socket';
import {
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
  initLedger,
  initMetamask,
} from '../utils/web3';
import * as resourcesActions from '../actions/resources';
import {
  showModal,
  sendSocketMessage,
  setProfileState,
  setUiState,
} from '../actions';
import BigNumber from '../utils/BigNumber';

const loadEthPrice = async () => {
  const res = await fetch('https://api.coinmarketcap.com/v1/ticker/ethereum/');
  return res.json();
};

export function* loadUser(): Saga<*> {
  const { web3Instance: web3 } = window;
  const prevAccounts = yield select(getProfileState('addresses'));
  let accounts = [];
  try {
    accounts = yield cps(web3.eth.getAccounts);
  } catch (e) {
    console.log('wow', e);
  }

  if (!equals(prevAccounts, accounts)) {
    yield put(setProfileState('addresses', accounts));
    yield put(setProfileState('balance', '0'));

    // TODO: better way to check if ledger is connected
    // eslint-disable-next-line
    if (web3._provider._providers && web3._provider._providers[0]._ledgerClientIfExists) {
      yield put(setProfileState('connectionStatus', connectionStatuses.NOT_CONNECTED));
      yield put(setProfileState('address', '0x0'));
      return;
    }
    if (!accounts.length) {
      yield put(setProfileState('connectionStatus', connectionStatuses.LOCKED));
      yield put(
        showModal({
          title: 'Your wallet is unavailable',
          type: 'warn',
          text: 'Please unlock or connect your wallet',
        }),
      );
    } else {
      yield call(loadUserData, { payload: { address: accounts[0] } });
    }
  }
}

export function* loadUserData({ payload: { address } }): Saga<*> {
  console.warn('NEW ACCOUNT');

  const socketConnected = yield select(getProfileState('socketConnected'));
  yield put(setProfileState('address', address));
  yield put(setProfileState('connectionStatus', connectionStatuses.CONNECTED));

  yield all([call(loadBalance), call(loadNetwork), call(loadUserOrders)]);
  // We need to access user orders, so we wait for it
  yield call(loadTokensBalance);
  if (!socketConnected) {
    const socket = yield call(socketConnect);
    yield fork(handleSocketIO, socket);
    yield put(setProfileState('socketConnected', true));
  }
  yield put(
    sendSocketMessage('login', {
      address,
    }),
  );
  trackMixpanel('Log in', { address });
}

export function* loadBalance(): Saga<*> {
  const { web3Instance: web3 } = window;
  const account = yield select(getProfileState('address'));
  const balance = yield cps(web3.eth.getBalance, account);
  const formattedBalance = web3.utils.fromWei(balance, 'ether');
  yield put(
    setProfileState(
      'balance',
      BigNumber(formattedBalance)
        .toFixed(8)
        .toString(),
    ),
  );
}

export function* loadTokensBalance() {
  const tokens = yield select(getResourceMappedList('tokens', 'allTokens'));
  const [current, pair] = yield call(loadCurrentTokenAndPairBalance);

  const addTokensBalancesAction = createActionCreators('update', {
    resourceName: 'tokens',
    request: 'addTokensBalances',
    list: 'allTokens',
  });

  try {
    const allTokens = yield all(
      tokens
        .filter(token => token.id !== current.id && token.id !== pair.id && token.is_listed)
        .map(function* (token) {
          const locked = yield select(getLockedTokenBalance(token));
          const res = yield getTokenBalanceAndAllowance(token, locked);
          return res;
        }),
    );

    yield put(
      addTokensBalancesAction.succeeded({
        resources: [pair, current, ...allTokens].map(t => ({ id: t.id, attributes: { ...t } })),
      }),
    );
  } catch (e) {
    console.error('Couldn load all tokens balance', e);
  }
}

export function* loadCurrentTokenAndPairBalance() {
  const currentToken = yield select(getCurrentToken);
  const currentPair = yield select(getCurrentPair);

  const lockedToken = yield select(getLockedTokenBalance(currentToken));
  const lockedPair = yield select(getLockedPairBalance);

  const addActiveUserTokensAction = createActionCreators('update', {
    resourceName: 'tokens',
    request: 'addActiveUserTokens',
    list: 'currentUserTokens',
    mergeListIds: false,
  });

  try {
    const current = yield getTokenBalanceAndAllowance(currentToken, lockedToken);
    const pair = yield getTokenBalanceAndAllowance(currentPair, lockedPair);

    yield put(
      addActiveUserTokensAction.succeeded({
        resources: [pair, current].map(t => ({ id: t.id, attributes: { ...t } })),
      }),
    );
    return [
      current,
      pair,
    ];
  } catch (e) {
    console.error('Couldnt load current token and pair balance', e);
    return [];
  }
}

export function* loadNetwork() {
  const { web3Instance: web3 } = window;
  const networkId = yield cps(web3.eth.net.getId);
  const network = getNetworkById(networkId);
  yield put(setProfileState('network', network));
}

function* getTokenBalanceAndAllowance(token, locked) {
  const { zeroEx } = window;
  const account = yield select(getProfileState('address'));
  const tokenBalance = yield call([zeroEx.token, zeroEx.token.getBalanceAsync], token.id, account);
  const allowance = yield call(
    [zeroEx.token, zeroEx.token.getProxyAllowanceAsync],
    token.id,
    account,
  );
  return {
    ...token,
    isTradable: allowance.gt(0),
    fullBalance: ZeroEx.toUnitAmount(tokenBalance, token.decimals).toFixed(6),
    balance: ZeroEx.toUnitAmount(tokenBalance, token.decimals)
      .minus(locked)
      .toFixed(6),
  };
}

export function* loadUserOrders() {
  const account = yield select(getProfileState('address'));
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
            completed_at: null,
            child_id: null,
            canceled_at: null,
            deleted_at: null,
            maker_address: account,
            status: 'new',
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
            deleted_at: null,
            maker_address: account,
            child_id: null,
            status: {
              notin: ['new', 'pending'],
            },
          },
        },
        sortBy: '-created_at',
      },
    }),
  );
}

export function* changeProvider({ payload: { provider } }): Saga<*> {
  yield put(setProfileState('provider', provider));
  if (provider === 'ledger') yield call(initLedger);
  if (provider === 'metamask') yield call(initMetamask);
  yield call(loadUser);
}

export function* updateEthPrice(): Saga<*> {
  try {
    const price = (yield call(loadEthPrice))[0].price_usd;
    yield put(setUiState('ethPrice', price));
  } catch (e) {
    console.error('Cant load eth price');
  }
}

export function* runLoadEthPrice(): Saga<*> {
  while (true) {
    yield fork(updateEthPrice);
    yield call(delay, 60000);
  }
}

export function* runLoadUser(): Saga<*> {
  while (true) {
    yield fork(loadUser);
    yield call(delay, 3000);
  }
}

export function* listenChangeProvider(): Saga<*> {
  yield takeEvery(types.CHANGE_PROVIDER, changeProvider);
}

export function* listenSetAddress(): Saga<*> {
  yield takeEvery(types.SET_ADDRESS, loadUserData);
}
