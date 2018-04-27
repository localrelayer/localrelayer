// @flow
import {
  take,
  select,
  fork,
  put,
  call,
} from 'redux-saga/effects';
import {
  delay,
} from 'redux-saga';
import createActionCreators from 'redux-resource-action-creators';
import type { Saga } from 'redux-saga';
import { getFormValues, reset } from 'redux-form';
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
  loadTokensBalance,
  loadBalance,
} from './profile';
import {
  getProfileState,
  getWethToken,
} from '../selectors';
import {
  trackMixpanel,
} from '../utils/mixpanel';
import BigNumber from '../utils/BigNumber';

const sagas = {
  deposit,
  withdraw,
  setAllowance,
  unsetAllowance,
};

const Web3 = require('web3');

export const startWeb3 = (): Promise<*> =>
  new Promise((resolve): any => {
    window.addEventListener('load', async () => {
    // Creating websocket web3 version
      const wsWeb3 = new Web3(new Web3.providers.WebsocketProvider('wss://mainnet.infura.io/_ws'));
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

      yield put(setUiState('isTxLoading', true));
      yield call([zeroEx, zeroEx.awaitTransactionMinedAsync], txHash);
      // Somewhy balance isn't updated until 10 seconds will end
      yield call(delay, 10000);
      yield put(setUiState('isTxLoading', false));

      trackMixpanel(
        'Deposit',
        { address: account },
      );

      yield put(sendNotification({ message: 'Deposit successful', type: 'success' }));
      yield call(loadTokensBalance);
      yield call(loadBalance);
    } catch (e) {
      yield put(sendNotification({ message: e.message, type: 'error' }));
      yield put(setUiState('isTxLoading', false));
      console.error(e);
    }
  }
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

    yield put(setUiState('activeModal', 'TxModal'));
    yield put(setUiState('txHash', txHash));

    yield put(reset('WrapForm'));

    yield put(setUiState('isTxLoading', true));
    yield call([zeroEx, zeroEx.awaitTransactionMinedAsync], txHash);

    // Somewhy balance isn't updated until 10 seconds will end
    yield call(delay, 10000);
    yield put(setUiState('isTxLoading', false));

    trackMixpanel(
      'Withdraw',
      { address: account },
    );

    yield put(sendNotification({ message: 'Withdrawal successful', type: 'success' }));
    yield call(loadTokensBalance);
    yield call(loadBalance);
  } catch (e) {
    yield put(sendNotification({ message: e.message, type: 'error' }));
    yield put(setUiState('isTxLoading', false));
    console.error(e);
  }
}

function* setAllowance(token) {
  const { zeroEx } = window;
  const account = yield select(getProfileState('address'));
  const provider = yield select(getProfileState('provider'));

  const { gasPrice, gasLimit } = yield select(getFormValues('GasForm'));
  const gasPriceWei = window.web3Instance.utils.toWei(gasPrice, 'gwei');
  try {
    const actions = createActionCreators('update', {
      resourceName: 'tokens',
      request: 'unlockToken',
      lists: ['allTokens', 'currentUserTokens'],
    });

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

    yield put(setUiState('isTxLoading', true));
    yield call([zeroEx, zeroEx.awaitTransactionMinedAsync], txHash);
    yield put(setUiState('isTxLoading', false));

    trackMixpanel(
      'Allowance setted',
      { address: account, token: token.id },
    );

    yield put(sendNotification({ message: `Trading for "${token.name}" enabled`, type: 'success' }));

    yield put(actions.succeeded({
      resources: [{
        id: token.id,
        attributes: {
          ...token,
          isTradable: true,
        },
      }],
    }));
  } catch (e) {
    yield put(sendNotification({ message: e.message, type: 'error' }));
    yield put(setUiState('isTxLoading', false));

    console.error(e);
  }
}

function* unsetAllowance(token) {
  const { zeroEx } = window;
  const account = yield select(getProfileState('address'));
  const provider = yield select(getProfileState('provider'));
  const { gasPrice, gasLimit } = yield select(getFormValues('GasForm'));
  const gasPriceWei = window.web3Instance.utils.toWei(gasPrice, 'gwei');
  try {
    const actions = createActionCreators('update', {
      resourceName: 'tokens',
      request: 'unlockToken',
      lists: ['allTokens', 'currentUserTokens'],
    });
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

    yield put(setUiState('isTxLoading', true));
    yield call([zeroEx, zeroEx.awaitTransactionMinedAsync], txHash);
    yield put(setUiState('isTxLoading', false));

    trackMixpanel(
      'Allowance unsetted',
      { address: account, token: token.id },
    );

    yield put(sendNotification({ message: `Trading for "${token.name}" disabled`, type: 'success' }));


    yield put(actions.succeeded({
      resources: [{
        id: token.id,
        attributes: {
          ...token,
          isTradable: false,
        },
      }],
    }));
  } catch (e) {
    yield put(sendNotification({ message: e.message, type: 'error' }));
    yield put(setUiState('isTxLoading', false));
    console.error(e);
  }
}

export function* listenCallContract(): Saga<void> {
  while (true) {
    const action = yield take(actionTypes.CALL_CONTRACT);
    yield fork(sagas[action.meta.method], action.payload);
  }
}
