import {
  takeEvery,
  select,
  put,
  call,
} from 'redux-saga/effects';
import type { Saga } from 'redux-saga';
import { ZeroEx } from '0x.js';
import BigNumber from 'bignumber.js';
import moment from 'moment';
import {
  reset,
} from 'redux-form';
import * as types from '../actions/types';
import {
  getAddress,
  getCurrentToken,
  getCurrentPair,
} from '../selectors';
import {
  sendNotification,
  saveResourceRequest,
} from '../actions';
import type {
  OrderData,
} from '../types';
import {
  NODE_ADDRESS,
  EXCHANGE_FEE,
  TRANSACTION_FEE,
} from '../utils/web3';
import * as resourcesActions from '../actions/resources';
import {
  loadTokensBalance,
} from './profile';

BigNumber.config({ EXPONENTIAL_AT: 5000 });

export function* createOrder({
  amount,
  price,
  exp,
  type,
}: OrderData): Saga<*> {
  const { zeroEx } = window;
  const { NULL_ADDRESS } = ZeroEx;
  const EXCHANGE_ADDRESS = yield zeroEx.exchange.getContractAddress();

  const address = yield select(getAddress);
  const currentToken = yield select(getCurrentToken);
  const currentPair = yield select(getCurrentPair);
  const total = BigNumber(price).times(amount).toString();

  let makerTokenAddress;
  let takerTokenAddress;
  let makerTokenAmount;
  let takerTokenAmount;
  if (type === 'sell') {
    const feeAmount = BigNumber(total).times(EXCHANGE_FEE).add(TRANSACTION_FEE.toFixed(6));

    makerTokenAddress = currentToken.id;
    takerTokenAddress = currentPair.id;
    makerTokenAmount =
      ZeroEx.toBaseUnitAmount(BigNumber(amount), currentToken.decimals);
    takerTokenAmount =
      ZeroEx.toBaseUnitAmount(BigNumber(total).minus(feeAmount), currentPair.decimals);
  } else if (type === 'buy') {
    const feeAmount = BigNumber(amount).times(EXCHANGE_FEE)
      .add(BigNumber(TRANSACTION_FEE).div(price).toFixed(6));

    makerTokenAddress = currentPair.id;
    takerTokenAddress = currentToken.id;
    makerTokenAmount =
      ZeroEx.toBaseUnitAmount(BigNumber(total), currentPair.decimals);
    takerTokenAmount =
      ZeroEx.toBaseUnitAmount(BigNumber(amount).minus(feeAmount), currentToken.decimals);
  }
  const zrxOrder = {
    maker: address,
    taker: NODE_ADDRESS,
    feeRecipient: NULL_ADDRESS,
    exchangeContractAddress: EXCHANGE_ADDRESS,
    salt: ZeroEx.generatePseudoRandomSalt(),
    makerFee: BigNumber(0),
    takerFee: BigNumber(0),
    makerTokenAddress,
    takerTokenAddress,
    makerTokenAmount,
    takerTokenAmount,
    expirationUnixTimestampSec: BigNumber(moment(exp).unix()),
  };

  const orderHash = ZeroEx.getOrderHashHex(zrxOrder);
  try {
    const ecSignature = yield zeroEx.signOrderHashAsync(orderHash, address, true);
    const signedZRXOrder = {
      ...zrxOrder,
      ecSignature,
    };
    yield zeroEx.exchange.validateOrderFillableOrThrowAsync(signedZRXOrder);

    const order = {
      price: +price,
      amount: +amount,
      total: +total,
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
      lists: [type, 'userOrders'],
      message: 'Order created',
      data: {
        attributes: order,
        resourceName: 'orders',
      },
    }));
    yield put(reset('BuySellForm'));
    yield call(loadTokensBalance);
  } catch (e) {
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
        filterCondition: {
          filter: {
            'token.address': {
              eq: currentToken.id,
            },
            'completed_at': null,
            'child_id': null,
            'canceled_at': null,
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
        filterCondition: {
          filter: {
            'token.address': {
              eq: currentToken.id,
            },
            'completed_at': null,
            'child_id': null,
            'canceled_at': null,
            'deleted_at': null,
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

export function* cancelOrder(action) {
  const order = {
    ...action.payload,
    canceled_at: moment().toISOString(),
  };
  yield put(saveResourceRequest({
    resourceName: 'orders',
    request: 'cancelOrder',
    mergeResources: false,
    message: 'Order Canceled',
    lists: [order.type, 'userOrders'],
    data: {
      id: order.id,
      attributes: order,
      resourceName: 'orders',
    },
  }));
  yield call(loadTokensBalance);
}

export function* listenNewOrder(): Saga<*> {
  yield takeEvery(types.CREATE_ORDER, action => createOrder(action.payload));
}

export function* listenCancelOrder(): Saga<*> {
  yield takeEvery(types.CANCEL_ORDER, cancelOrder);
}
