import {
  takeEvery,
  select,
  put,
  call,
  cps,
} from 'redux-saga/effects';
import createActionCreators from 'redux-resource-action-creators';
import type { Saga } from 'redux-saga';
import { ZeroEx } from '0x.js';
import moment from 'moment';
import {
  reset,
  getFormValues,
} from 'redux-form';
import * as types from '../actions/types';
import {
  getCurrentToken,
  getCurrentPair,
  getUiState,
  getProfileState,
} from '../selectors';
import {
  sendNotification,
  saveResourceRequest,
  sendMessage,
  setUiState,
  showModal,
  sendSocketMessage,
} from '../actions';
import {
  NODE_ADDRESS,
} from '../utils/web3';
import * as resourcesActions from '../actions/resources';
import {
  loadTokensBalance, loadCurrentTokenAndPairBalance,
} from './profile';
import config from '../config';
import {
  customApiRequest,
} from '../api';
import {
  trackMixpanel,
} from '../utils/mixpanel';
import BigNumber from '../utils/BigNumber';
import {
  throwError,
} from './utils';

export function* createOrder(): Saga<*> {
  const { zeroEx } = window;
  const EXCHANGE_ADDRESS = yield zeroEx.exchange.getContractAddress();

  const { amount, price } = yield select(getFormValues('BuySellForm'));
  const type = yield select(getUiState('activeTab'));
  const exp = moment().add('1', 'year');

  const balance = yield select(getProfileState('balance'));
  const address = yield select(getProfileState('address'));
  const provider = yield select(getProfileState('provider'));

  const currentToken = yield select(getCurrentToken);
  const currentPair = yield select(getCurrentPair);
  const total = BigNumber(price).times(amount).toFixed(12).toString();

  let makerTokenAddress;
  let takerTokenAddress;
  let makerTokenAmount;
  let takerTokenAmount;
  if (type === 'sell') {
    // Check allowance for token

    const allowance = yield call(
      [zeroEx.token, zeroEx.token.getProxyAllowanceAsync],
      currentToken.id,
      address,
    );

    if (allowance.eq(0)) {
      yield put(setUiState('activeModal', 'AllowanceModal'));
      yield put(setUiState('onTxOk', { action: 'createOrder', args: [] }));
      return;
    }

    makerTokenAddress = currentToken.id;
    takerTokenAddress = currentPair.id;
    makerTokenAmount =
      ZeroEx.toBaseUnitAmount(BigNumber(amount), currentToken.decimals);
    takerTokenAmount =
      ZeroEx.toBaseUnitAmount(BigNumber(total), currentPair.decimals);
  } else if (type === 'buy') {
    // Check wrapped amount for WETH

    if (currentPair.symbol === 'WETH' && currentPair.is_listed) {
      if (BigNumber(currentPair.balance).lt(total) && BigNumber(balance).gt(total)) {
        yield put(setUiState('activeModal', 'WrapModal'));
        yield put(setUiState('wrapAmount', BigNumber(total).minus(currentPair.balance)));
        yield put(setUiState('onTxOk', { action: 'createOrder', args: [] }));
        return;
      }
    }

    // Check allowance for pair

    const allowance = yield call(
      [zeroEx.token, zeroEx.token.getProxyAllowanceAsync],
      currentPair.id,
      address,
    );

    if (allowance.eq(0)) {
      yield put(setUiState('activeModal', 'AllowanceModal'));
      yield put(setUiState('onTxOk', { action: 'createOrder', args: [] }));
      return;
    }

    makerTokenAddress = currentPair.id;
    takerTokenAddress = currentToken.id;
    makerTokenAmount =
      ZeroEx.toBaseUnitAmount(BigNumber(total), currentPair.decimals);
    takerTokenAmount =
      ZeroEx.toBaseUnitAmount(BigNumber(amount), currentToken.decimals);
  }
  const zrxOrder = {
    maker: address.toLowerCase(),
    taker: NODE_ADDRESS,
    feeRecipient: '0x004e344251110fa1cb09aa31c95c6598ed07dce6',
    exchangeContractAddress: EXCHANGE_ADDRESS,
    salt: ZeroEx.generatePseudoRandomSalt(),
    makerFee: BigNumber(0),
    takerFee: BigNumber(0),
    makerTokenAddress: makerTokenAddress.toLowerCase(),
    takerTokenAddress: takerTokenAddress.toLowerCase(),
    makerTokenAmount,
    takerTokenAmount,
    expirationUnixTimestampSec: BigNumber(exp.unix()),
  };

  const orderHash = ZeroEx.getOrderHashHex(zrxOrder);

  try {
    if (provider === 'ledger') {
      yield put(showModal({
        title: 'Ledger action required',
        type: 'info',
        text: 'Confirm transaction on your Ledger',
      }));
    }

    const ecSignature = yield zeroEx.signOrderHashAsync(orderHash, address, provider === 'metamask');
    const signedZRXOrder = {
      ...zrxOrder,
      ecSignature,
    };
    yield put(sendMessage({ content: 'Placing order', type: 'loading' }));
    yield zeroEx.exchange.validateOrderFillableOrThrowAsync(signedZRXOrder);
    const order = {
      price: (+price).toFixed(12),
      amount: (+amount).toFixed(12),
      total: (+total).toFixed(12),
      token_address: currentToken.id,
      pair_address: currentPair.id,
      type,
      zrxOrder: signedZRXOrder,
      expires_at: exp.toISOString(),
      maker_address: address,
      order_hash: orderHash,
    };

    yield put(saveResourceRequest({
      resourceName: 'orders',
      request: 'createOrder',
      lists: ['userOrders', type],
      data: {
        attributes: order,
        resourceName: 'orders',
      },
    }));
    yield put(reset('BuySellForm'));
    // recalculate balance with new locked amount
    yield call(loadCurrentTokenAndPairBalance);
    trackMixpanel(
      'Order created',
      { address, token: currentToken.id },
    );
  } catch (e) {
    yield call(throwError, e);
    yield put(sendNotification({ message: e.message, type: 'error' }));
    console.error(e);
  }
}

export function* loadOrders(): Saga<*> {
  const currentToken = yield select(getCurrentToken);
  yield put(
    resourcesActions.fetchResourcesRequest({
      resourceName: 'orders',
      list: 'buy',
      request: 'fetchOrders',
      withDeleted: false,
      mergeListIds: false,
      fetchQuery: {
        limitCondition: {
          limit: 50,
        },
        filterCondition: {
          filter: {
            'token.address': {
              eq: currentToken.id,
            },
            'completed_at': null,
            'child_id': null,
            'canceled_at': null,
            'status': 'new',
            'deleted_at': null,
            'type': 'buy',
          },
        },
        sortBy: '-price',
      },
    }),
  );

  yield put(
    resourcesActions.fetchResourcesRequest({
      resourceName: 'orders',
      list: 'sell',
      request: 'fetchOrders',
      withDeleted: false,
      mergeListIds: false,
      fetchQuery: {
        limitCondition: {
          limit: 50,
        },
        filterCondition: {
          filter: {
            'token.address': {
              eq: currentToken.id,
            },
            'completed_at': null,
            'child_id': null,
            'canceled_at': null,
            'deleted_at': null,
            'status': 'new',
            'type': 'sell',
          },
        },
        sortBy: 'price',
      },
    }),
  );

  yield put(
    resourcesActions.fetchResourcesRequest({
      resourceName: 'orders',
      list: 'completedOrders',
      request: 'fetchCompletedOrders',
      withDeleted: false,
      mergeListIds: false,
      fetchQuery: {
        limitCondition: {
          limit: 500,
        },
        filterCondition: {
          filter: {
            'token.address': {
              eq: currentToken.id,
            },
            'is_history': true,
            'canceled_at': null,
            'deleted_at': null,
            'completed_at': {
              'ne': null,
            },
          },
        },
        sortBy: '-created_at',
      },
    }),
  );
}

export function* cancelOrder({
  orderId,
}: {
  orderId: string,
}) {
  try {
    const actions = createActionCreators('delete', {
      resourceName: 'orders',
      request: 'cancelOrder',
    });
    yield put(actions.pending());
    const account = yield select(getProfileState('address'));
    const provider = yield select(getProfileState('provider'));

    let signature;

    if (provider === 'ledger') {
      yield put(showModal({
        title: 'Ledger action required',
        type: 'info',
        text: 'Confirm transaction on your Ledger',
      }));
      signature = yield call([
        window.ledgerSubprovider,
        window.ledgerSubprovider.signPersonalMessageAsync,
      ],
      window.web3Instance.utils.toHex('Confirmation to cancel order'),
      account);
    } else {
      signature = yield cps(
        window.web3Instance.eth.personal.sign,
        'Confirmation to cancel order',
        account,
      );
    }
    yield call(customApiRequest, {
      url: `${config.apiUrl}/orders/${orderId}/cancel`,
      method: 'POST',
      body: JSON.stringify({
        signature,
      }),
    });
    yield put(actions.succeeded({
      resources: [orderId],
    }));
    yield call(loadTokensBalance);
  } catch (err) {
    yield call(throwError, err);
    yield put(sendNotification({ message: err.message, type: 'error' }));
  }
}

export const formatZrxOrder = order => ({
  ...order,
  makerTokenAmount: BigNumber(order.makerTokenAmount),
  takerTokenAmount: BigNumber(order.takerTokenAmount),
  expirationUnixTimestampSec: BigNumber(order.expirationUnixTimestampSec),
  makerFee: BigNumber(order.makerFee),
  takerFee: BigNumber(order.takerFee),
});

export function* fillOrKillOrders({ payload: { order, orders } }) {
  const address = yield select(getProfileState('address'));
  const { zeroEx } = window;
  const signedOrders = orders.map(o => formatZrxOrder(o.zrxOrder));

  const txHash = yield call(
    [zeroEx.exchange, zeroEx.exchange.fillOrdersUpToAsync],
    signedOrders,
    BigNumber(order.attributes.zrxOrder.takerTokenAmount),
    true,
    address,
  );

  yield put(saveResourceRequest({
    resourceName: 'orders',
    request: 'createOrder',
    lists: ['userOrders', order.type],
    data: {
      attributes: order,
      resourceName: 'orders',
    },
  }));

  yield call(customApiRequest, {
    url: `${config.apiUrl}/orders/update`,
    method: 'POST',
    body: JSON.stringify({
      orders,
      order: order.id,
      txHash,
    }),
  });

  console.log(txHash);
}

export function* listenNewOrder(): Saga<*> {
  yield takeEvery(types.CREATE_ORDER, action => createOrder(action.payload));
}

export function* listenCancelOrder(): Saga<*> {
  yield takeEvery(types.CANCEL_ORDER, cancelOrder);
}

export function* listenFillOrKillOrders(): Saga<*> {
  yield takeEvery(types.FILL_OR_KILL_ORDERS, fillOrKillOrders);
}
