import {
  takeEvery,
  select,
  put,
  call,
} from 'redux-saga/effects';
import {
  delay,
} from 'redux-saga';
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
  addResourceItem,
  sendNotification,
} from '../actions';
import {
  loadTokensBalance,
} from './profile';
import type {
  OrderData,
  ZrxOrder,
} from '../types';

BigNumber.config({ EXPONENTIAL_AT: 50 });

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
  let makerTokenAddress;
  let takerTokenAddress;
  let makerTokenAmount;
  let takerTokenAmount;
  if (type === 'sell') {
    makerTokenAddress = currentToken.address;
    takerTokenAddress = currentPair.address;
    makerTokenAmount =
      ZeroEx.toBaseUnitAmount(new BigNumber(amount), currentToken.decimals);
    takerTokenAmount =
      ZeroEx.toBaseUnitAmount(new BigNumber(price).times(amount), currentPair.decimals);
  } else if (type === 'buy') {
    makerTokenAddress = currentPair.address;
    takerTokenAddress = currentToken.address;
    makerTokenAmount =
      ZeroEx.toBaseUnitAmount(new BigNumber(price).times(amount), currentPair.decimals);
    takerTokenAmount =
      ZeroEx.toBaseUnitAmount(new BigNumber(amount), currentToken.decimals);
  }
  const zrxOrder = {
    maker: address,
    taker: NULL_ADDRESS,
    feeRecipient: NULL_ADDRESS,
    exchangeContractAddress: EXCHANGE_ADDRESS,
    salt: ZeroEx.generatePseudoRandomSalt(),
    makerFee: new BigNumber(0),
    takerFee: new BigNumber(0),
    makerTokenAddress,
    takerTokenAddress,
    makerTokenAmount,
    takerTokenAmount,
    expirationUnixTimestampSec: new BigNumber(moment(exp).unix()),
  };
  const orderHash = ZeroEx.getOrderHashHex(zrxOrder);
  try {
    const ecSignature = yield zeroEx.signOrderHashAsync(orderHash, address);
    const signedZRXOrder = {
      ...zrxOrder,
      ecSignature,
    };
    yield zeroEx.exchange.validateOrderFillableOrThrowAsync(signedZRXOrder);

    const order = {
      price,
      amount,
      total: new BigNumber(price).times(amount).toString(),
      token_id: currentToken.address,
      action: type,
      completed_at: null,
      zrxOrder: signedZRXOrder,
    };

    yield put(addResourceItem({
      resourceName: "orders",
      id: orderHash,
      attributes: order,
      relationships: {},
    }));
    yield put(sendNotification({ message: 'Order created', type: 'success' }));
    yield put(reset('BuySellForm'));
  } catch (e) {
    yield put(sendNotification({ message: e.message, type: 'error' }));
    console.error(e);
  }
}

export function* fillOrder(payload: ZrxOrder): Saga<*> {
  const { zeroEx } = window;
  const address = yield select(getAddress);
  try {
    const txHash = yield call(
      [zeroEx.exchange, zeroEx.exchange.fillOrderAsync],
      payload,
      payload.takerTokenAmount,
      true, // shouldThrowOnInsufficientBalanceOrAllowance
      address, // takerAddress
    );
    yield call([zeroEx, zeroEx.awaitTransactionMinedAsync], txHash);
    yield call(delay, 12000);
    yield call(loadTokensBalance);

    yield put(sendNotification({ message: 'Order filled', type: 'success' }));
  } catch (e) {
    yield put(sendNotification({ message: e.message, type: 'error' }));
    console.error(e);
  }
}

export function* listenNewOrder(): Saga<*> {
  yield takeEvery(types.CREATE_ORDER, action => createOrder(action.payload));
}

export function* listenFillOrder(): Saga<*> {
  yield takeEvery(types.FILL_ORDER, action => fillOrder(action.payload));
}

