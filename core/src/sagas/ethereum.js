// @flow
import {
  take,
  select,
  fork,
  put,
  call,
} from 'redux-saga/effects';
import {
  eventChannel,
  delay,
} from 'redux-saga';
import createActionCreators from 'redux-resource-action-creators';
import type { Saga } from 'redux-saga';
import { getFormValues, reset } from 'redux-form';
import moment from 'moment';
import { ZeroEx } from '0x.js';
import {
  ledgerEthereumBrowserClientFactoryAsync as ledgerEthereumClientFactoryAsync,
  LedgerSubprovider,
} from '@0xproject/subproviders';
import * as actionTypes from '../actions/types';
import {
  sendNotification,
  setUiState,
  showModal,
} from '../actions/ui';
import {
  loadCurrentTokenAndPairBalance,
  loadBalance,
} from './profile';
import {
  getProfileState,
  getWethToken,
  getResourceItemBydId,
} from '../selectors';
import {
  trackMixpanel,
} from '../utils/mixpanel';
import BigNumber from '../utils/BigNumber';
import WETH from '../utils/WETH';
import { setProfileState } from '../actions';

const Web3 = require('web3');

window.Web3 = Web3;

const sagas = {
  deposit,
  withdraw,
  setAllowance,
  unsetAllowance,
};

export const startWeb3 = (): Promise<*> =>
  new Promise((resolve): any => {
    window.addEventListener('load', async () => {
    // Creating websocket web3 version
      // const wsUrl = process.env.NODE_ENV === 'production' ? 'wss://mainnet.infura.io/_ws' : 'ws://localhost:8546';
      const wsUrl = 'wss://mainnet.infura.io/_ws';
      const wsWeb3 = new Web3(new Web3.providers.WebsocketProvider(wsUrl));
      window.wsWeb3 = wsWeb3;
      await initMetamask();
      await initLedger();
      resolve();
    });
  });

export const initMetamask = async () => {
  if (typeof window.web3 !== 'undefined') {
    const web3 = new Web3(window.web3.currentProvider);
    let networkId = 1;
    try {
      networkId = +await web3.eth.net.getId();
    } catch (e) {
      console.warn("Couldn't get a network, using mainnet", e);
      networkId = 1;
    }
    const zeroEx = new ZeroEx(window.web3.currentProvider, {
      networkId,
    });
    window.zeroEx = zeroEx;
    window.web3Instance = web3;
  }
};

export const initLedger = async () => {
  const networkId = 1;
  const ledgerSubprovider = new LedgerSubprovider({
    networkId,
    ledgerEthereumClientFactoryAsync,
  });
  window.ledgerSubprovider = ledgerSubprovider;
};

export function* getItemFromLocalStorage(key: string): Saga<*> {
  const itemSerialized = yield call([localStorage, localStorage.getItem], key);
  if (!itemSerialized) return null;
  const item = JSON.parse(itemSerialized);
  return item;
}

export function* setItemToLocalStorage(key: string, value: any): Saga<*> {
  yield call([localStorage, localStorage.setItem], key, value);
}

export function* addTransactionToLocalStorage(transaction: Object): Saga<*> {
  try {
    const pendingTransactions = (yield call(getItemFromLocalStorage, 'pendingTransactions')) || [];
    yield put(setProfileState('pendingTransactions', [...pendingTransactions, transaction]));
    yield call(setItemToLocalStorage, 'pendingTransactions', JSON.stringify([...pendingTransactions, transaction]));
  } catch (e) {
    console.error('Couldnt add pending transaction to local storage ', e);
  }
}

export function* removeTransactionFromLocalStorage(txHash: string): Saga<*> {
  try {
    const pendingTransactions = (yield call(getItemFromLocalStorage, 'pendingTransactions')) || [];
    const newPendingTransactions = pendingTransactions.filter(t => t.txHash !== txHash);

    console.log(txHash, newPendingTransactions);

    yield call(setItemToLocalStorage, 'pendingTransactions', JSON.stringify(newPendingTransactions));
    yield put(setProfileState('pendingTransactions', newPendingTransactions));
  } catch (e) {
    console.error('Couldnt remove pending transaction from local storage ', e);
  }
}

function subscribe(contract) {
  return eventChannel((emit) => {
    contract.on('data', (data) => {
      emit(data);
    });
    contract.on('error', (e) => {
      console.warn(contract, e);
    });
    return () => contract.unsubscribe();
  });
}

function* readEvent(event, eventName) {
  const channel = yield call(subscribe, event);
  while (true) {
    const data = yield take(channel);
    yield fork(eventProcessorMapping[eventName], data);
    channel.close();
  }
}

const eventProcessorMapping = {
  'Withdrawal': processWithdrawal,
  'Deposit': processDeposit,
  'TokenApproval': processTokenApproval,
};

function* processWithdrawal({ transactionHash }) {
  if (process.env.NODE_ENV === 'development') {
    yield delay(10000);
  }
  yield put(sendNotification({ message: 'Withdrawal successful', type: 'success' }));
  yield call(removeTransactionFromLocalStorage, transactionHash);
  yield call(loadCurrentTokenAndPairBalance);
  yield call(loadBalance);
}

function* processDeposit({ transactionHash }) {
  if (process.env.NODE_ENV === 'development') {
    yield delay(10000);
  }
  yield put(sendNotification({ message: 'Deposit successful', type: 'success' }));
  yield call(removeTransactionFromLocalStorage, transactionHash);
  yield call(loadCurrentTokenAndPairBalance);
  yield call(loadBalance);
}

function* processTokenApproval({ returnValues, transactionHash, address }) {
  if (process.env.NODE_ENV === 'development') {
    yield delay(10000);
  }

  const { attributes: token } = yield select(getResourceItemBydId('tokens', address.toLowerCase()));

  const isTradable = BigNumber(returnValues.wad).gt(0);
  yield put(sendNotification({ message: `Trading for "${token.name}" ${isTradable ? 'enabled' : 'disabled'}`, type: 'success' }));
  yield call(removeTransactionFromLocalStorage, transactionHash);

  const actions = createActionCreators('update', {
    resourceName: 'tokens',
    request: 'allowance',
    lists: ['allTokens', 'currentUserTokens'],
  });
  yield put(actions.succeeded({
    resources: [{
      id: token.id,
      attributes: {
        ...token,
        isTradable,
      },
    }],
  }));
}

function* subscribeDeposit(): Saga<*> {
  const weth = yield select(getWethToken);
  const WETHContract = new window.wsWeb3.eth.Contract(WETH, weth.id);
  const account = yield select(getProfileState('address'));
  const Deposit = yield call(WETHContract.events.Deposit,
    {
      filter: { dst: account },
    });
  yield fork(readEvent, Deposit, 'Deposit');
}

// Deposit WETH (wrap)
function* deposit() {
  const { zeroEx } = window;

  const weth = yield select(getWethToken);
  const { amount } = yield select(getFormValues('WrapForm'));
  const { gasPrice, gasLimit } = yield select(getFormValues('GasForm'));
  const gasPriceWei = window.web3Instance.utils.toWei(gasPrice, 'gwei');

  const account = yield select(getProfileState('address'));
  const balance = yield select(getProfileState('balance'));
  const provider = yield select(getProfileState('provider'));

  if (balance <= 0.0001) {
    yield put(showModal({
      title: 'Do not deposit all of your ETH!',
      type: 'info',
      text: 'You need a small amount to pay for gas.',
    }));
  } else {
    const ethToConvert = ZeroEx.toBaseUnitAmount(new BigNumber(amount), weth.decimals);
    try {
      if (provider === 'ledger') {
        yield put(showModal({
          title: 'Ledger action required',
          type: 'info',
          text: 'Confirm transaction on your Ledger',
        }));
      }
      const txHash = yield call([zeroEx.etherToken, zeroEx.etherToken.depositAsync],
        weth.id,
        ethToConvert,
        account,
        {
          gasLimit,
          gasPrice: BigNumber(gasPriceWei),
        });

      yield put(setUiState('activeModal', 'TxModal'));
      yield put(setUiState('txHash', txHash));

      yield put(reset('WrapForm'));
      const transaction = {
        txHash,
        label: 'Deposit',
        name: 'Deposit',
        token: weth.symbol,
        tokenId: weth.id,
        timestamp: moment().toISOString(),
      };
      yield call(addTransactionToLocalStorage, transaction);
      trackMixpanel(
        'Deposit',
        { address: account },
      );
      yield call(subscribeDeposit);
    } catch (e) {
      yield put(sendNotification({ message: e.message, type: 'error' }));
      console.error(e);
    }
  }
}

function* subscribeWithdraw(): Saga<*> {
  const weth = yield select(getWethToken);
  const WETHContract = new window.wsWeb3.eth.Contract(WETH, weth.id);
  const account = yield select(getProfileState('address'));
  const Withdrawal = yield call(WETHContract.events.Withdrawal,
    {
      filter: { src: account },
    });
  yield fork(readEvent, Withdrawal, 'Withdrawal');
}

// Withdraw WETH (unwrap)
function* withdraw() {
  const { zeroEx } = window;

  const weth = yield select(getWethToken);
  const { amount } = yield select(getFormValues('WrapForm'));
  const { gasPrice, gasLimit } = yield select(getFormValues('GasForm'));
  const gasPriceWei = window.web3Instance.utils.toWei(gasPrice, 'gwei');

  const account = yield select(getProfileState('address'));
  const provider = yield select(getProfileState('provider'));

  const ethToConvert = ZeroEx.toBaseUnitAmount(new BigNumber(amount), weth.decimals);
  try {
    if (provider === 'ledger') {
      yield put(showModal({
        title: 'Ledger action required',
        type: 'info',
        text: 'Confirm transaction on your Ledger',
      }));
    }
    const txHash = yield call([zeroEx.etherToken, zeroEx.etherToken.withdrawAsync],
      weth.id,
      ethToConvert,
      account,
      {
        gasLimit,
        gasPrice: BigNumber(gasPriceWei),
      });

    const transaction = {
      txHash,
      label: 'Withdrawal',
      name: 'Withdrawal',
      tokenId: weth.id,
      token: weth.symbol,
      timestamp: moment().toISOString(),
    };
    yield call(addTransactionToLocalStorage, transaction);

    yield put(setUiState('activeModal', 'TxModal'));
    yield put(setUiState('txHash', txHash));

    yield put(reset('WrapForm'));

    trackMixpanel(
      'Withdraw',
      { address: account },
    );
    yield call(subscribeWithdraw);
  } catch (e) {
    yield put(sendNotification({ message: e.message, type: 'error' }));
    console.error(e);
  }
}

function* subscribeAllowance(tokenId: string): Saga<*> {
  const TokenContract = new window.wsWeb3.eth.Contract(WETH, tokenId);
  const account = yield select(getProfileState('address'));

  const TokenApproval = yield call(TokenContract.events.Approval,
    {
      filter: { src: account },
    });

  yield fork(readEvent, TokenApproval, 'TokenApproval');
}

function* setAllowance(token) {
  const { zeroEx } = window;
  const account = yield select(getProfileState('address'));
  const provider = yield select(getProfileState('provider'));

  const { gasPrice, gasLimit } = yield select(getFormValues('GasForm'));
  const gasPriceWei = window.web3Instance.utils.toWei(gasPrice, 'gwei');

  try {
    if (provider === 'ledger') {
      yield put(showModal({
        title: 'Ledger action required',
        type: 'info',
        text: 'Confirm transaction on your Ledger',
      }));
    }
    const txHash = yield call(
      [zeroEx.token, zeroEx.token.setUnlimitedProxyAllowanceAsync],
      token.id,
      account,
      { gasPrice: BigNumber(gasPriceWei), gasLimit },
    );


    yield put(setUiState('activeModal', 'TxModal'));
    yield put(setUiState('txHash', txHash));


    const transaction = {
      txHash,
      label: 'Allow Trading',
      name: 'TokenApproval',
      tokenId: token.id,
      token: token.symbol,
      timestamp: moment().toISOString(),
    };
    yield call(addTransactionToLocalStorage, transaction);

    trackMixpanel(
      'Allowance setted',
      { address: account, token: token.id },
    );
    yield call(subscribeAllowance, token.id);
  } catch (e) {
    yield put(sendNotification({ message: e.message, type: 'error' }));

    console.error(e);
  }
}

function* unsetAllowance(token) {
  const { zeroEx } = window;
  const account = yield select(getProfileState('address'));
  const provider = yield select(getProfileState('provider'));
  const { gasPrice, gasLimit } = yield select(getFormValues('GasForm'));
  const gasPriceWei = window.web3Instance.utils.toWei(gasPrice, 'gwei');
  console.log('YOUFEF')
  try {
    if (provider === 'ledger') {
      yield put(showModal({
        title: 'Ledger action required',
        type: 'info',
        text: 'Confirm transaction on your Ledger',
      }));
    }

    const txHash = yield call(
      [zeroEx.token, zeroEx.token.setProxyAllowanceAsync],
      token.id,
      account,
      BigNumber(0),
      { gasPrice: BigNumber(gasPriceWei), gasLimit },
    );
    yield put(setUiState('activeModal', 'TxModal'));
    yield put(setUiState('txHash', txHash));

    const transaction = {
      txHash,
      label: 'Disable Trading',
      name: 'TokenApproval',
      tokenId: token.id,
      token: token.symbol,
      timestamp: moment().toISOString(),
    };
    yield call(addTransactionToLocalStorage, transaction);

    trackMixpanel(
      'Allowance unsetted',
      { address: account, token: token.id },
    );
    yield call(subscribeAllowance, token.id);
  } catch (e) {
    yield put(sendNotification({ message: e.message, type: 'error' }));
    console.error(e);
  }
}

export function* listenCallContract(): Saga<void> {
  while (true) {
    const action = yield take(actionTypes.CALL_CONTRACT);
    yield fork(sagas[action.meta.method], action.payload);
  }
}

export const eventNameSubscriptionMapping = {
  'Withdrawal': subscribeWithdraw,
  'Deposit': subscribeDeposit,
  'TokenApproval': subscribeAllowance,
};
