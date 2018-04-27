import {
  select,
  call,
  put,
  cps,
  fork,
  all,
  takeEvery,
} from 'redux-saga/effects';
import moment from 'moment';
import {
  delay,
} from 'redux-saga';
import {
  ZeroEx,
} from '0x.js';
import Web3ProviderEngine from 'web3-provider-engine';
import createActionCreators from 'redux-resource-action-creators';
import type {
  Saga,
} from 'redux-saga';
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
  getWethToken,
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
  setUiState,
} from '../actions';
import BigNumber from '../utils/BigNumber';
import WETH from '../utils/WETH';

const RpcSubprovider = require('web3-provider-engine/subproviders/rpc.js');

const loadEthPrice = async () => {
  const res = await fetch('https://api.coinmarketcap.com/v1/ticker/ethereum/');
  return res.json();
};

export function* loadUser(): Saga<*> {
  const { web3Instance: web3 } = window;
  const provider = yield select(getProfileState('provider'));
  let accounts = [];
  if (provider === 'ledger') {
    try {
      accounts = yield call([window.ledgerSubprovider, window.ledgerSubprovider.getAccountsAsync]);
    } catch (e) {
      console.warn(e.toString());
    }
  } else {
    accounts = yield call(web3.eth.getAccounts);
  }
  yield put(setProfileState('addresses', accounts));
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

export function* loadUserData({ payload: { address } }): Saga<*> {
  console.warn('NEW ACCOUNT');

  const socketConnected = yield select(getProfileState('socketConnected'));
  yield put(setProfileState('address', address));
  yield put(setProfileState('connectionStatus', connectionStatuses.CONNECTED));

  yield all([call(loadBalance), call(loadNetwork), call(loadUserOrders)]);
  // We need to access user orders, so we wait for it
  yield call(loadTokensBalance);
  // yield call(loadUserEvents);
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
          const res = yield call(getTokenBalanceAndAllowance, token, locked);
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
    const current = yield call(getTokenBalanceAndAllowance, currentToken, lockedToken);
    const pair = yield call(getTokenBalanceAndAllowance, currentPair, lockedPair);

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
  let networkId = 1;
  try {
    networkId = yield call(window.web3Instance.eth.net.getId);
  } catch (e) {
    console.warn("Couldn't get a network, using mainnet", e);
    networkId = 1;
  }
  yield put(setProfileState('provider', provider));
  if (provider === 'ledger') {
    const providerEngine = new Web3ProviderEngine();
    providerEngine.addProvider(window.ledgerSubprovider);
    providerEngine.addProvider(
      new RpcSubprovider({
        rpcUrl: 'https://mainnet.infura.io/metamask',
      }),
    );
    providerEngine.start();
    // network connectivity error
    providerEngine.on('error', (err) => {
    // report connectivity errors
      console.error(err.stack);
    });
    window.zeroEx.setProvider(providerEngine, networkId);
  }
  if (provider === 'metamask') {
    window.zeroEx.setProvider(window.web3.currentProvider, networkId);
  }
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

export function* loadUserEvents(): Saga<*> {
  try {
    const token = yield select(getCurrentToken);
    const weth = yield select(getWethToken);
    const pair = yield select(getCurrentPair);

    const TokenContract = new window.wsWeb3.eth.Contract(WETH, token.id);
    const PairContract = new window.wsWeb3.eth.Contract(WETH, pair.id);

    const WETHContract = new window.wsWeb3.eth.Contract(WETH, weth.id);
    const address = yield select(getProfileState('address'));

    const lastBlock = yield call(window.wsWeb3.eth.getBlockNumber);

    console.log(lastBlock);

    // 180 000 blocks in month

    const fromBlock = lastBlock - 180000;

    const Withdrawals = yield call([WETHContract, WETHContract.getPastEvents],
      'Withdrawal',
      {
        fromBlock,
        filter: { src: address },
      });
    const Deposits = yield call([WETHContract, WETHContract.getPastEvents],
      'Deposit',
      {
        fromBlock,
        filter: { dst: address },
      });

    const TokenApprovals = yield call([TokenContract, TokenContract.getPastEvents],
      'Approval',
      {
        fromBlock,
        filter: { src: address },
      });

    const PairApprovals = yield call([PairContract, TokenContract.getPastEvents],
      'Approval',
      {
        fromBlock,
        filter: { src: address },
      });

    const TokenTransfers = yield call([TokenContract, TokenContract.getPastEvents],
      'Transfer',
      {
        fromBlock,
        filter: { src: address },
      });

    const PairTransfers = yield call([PairContract, TokenContract.getPastEvents],
      'Transfer',
      {
        fromBlock,
        filter: { src: address },
      });

    const allEvents = [
      ...Withdrawals,
      ...Deposits,
      ...TokenApprovals,
      ...PairApprovals,
      ...TokenTransfers,
      ...PairTransfers,
    ];
    console.log(allEvents);

    const eventPromises = allEvents
      .sort((e1, e2) => e1.blockNumber > e2.blockNumber)
      .map(async (event) => {
        const block = await window.web3Instance.eth.getBlock(event.blockNumber);
        return {
          name: event.event,
          timestamp: moment.unix(block.timestamp).format('ddd, MMM DD, YYYY hh:mm:ss A'),
          txHash: event.transactionHash,
          type: event.type,
        };
      });

    // WETHContract.events.Withdrawal({
    //   fromBlock,
    //   filter: { src: address },
    // }, (error, event) => {
    //   if (error) console.error(error);
    // })
    //   .on('data', (event) => {
    //     console.warn(event); // same results as the optional callback above
    //   });

    const formattedEvents = yield all(eventPromises);

    console.log(formattedEvents);
  } catch (e) {
    console.error('Couldnt get events', e);
  }
}

function* checkNewMetamaskAccount() {
  const { web3Instance: web3 } = window;
  const prevAddress = yield select(getProfileState('address'));
  const provider = yield select(getProfileState('provider'));
  const accounts = yield call(web3.eth.getAccounts);
  if (provider === 'metamask' && (prevAddress !== accounts[0])) {
    yield call(loadUserData, { payload: { address: accounts[0] } });
  }
}

export function* runLoadEthPrice(): Saga<*> {
  while (true) {
    yield fork(updateEthPrice);
    yield call(delay, 60000);
  }
}

export function* watchNewMetamaskAccount(): Saga<*> {
  while (true) {
    yield fork(checkNewMetamaskAccount);
    yield call(delay, 2000);
  }
}

export function* listenChangeProvider(): Saga<*> {
  yield takeEvery(types.CHANGE_PROVIDER, changeProvider);
}

export function* listenSetAddress(): Saga<*> {
  yield takeEvery(types.SET_ADDRESS, loadUserData);
}
