import {
  takeEvery,
  select,
  put,
  call,
} from 'redux-saga/effects';
import { ZeroEx } from '0x.js';
import BigNumber from 'bignumber.js';
import moment from 'moment';
import { reset } from 'redux-form';
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

BigNumber.config({ EXPONENTIAL_AT: 50 });

export function* createOrder({
  payload: {
    amount,
    price,
    exp,
    type,
  },
}) {
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
    makerTokenAmount = ZeroEx.toBaseUnitAmount(new BigNumber(amount), 18);
    takerTokenAmount = ZeroEx.toBaseUnitAmount(new BigNumber(price).times(amount), 18);
  } else if (type === 'buy') {
    makerTokenAddress = currentPair.address;
    takerTokenAddress = currentToken.address;
    makerTokenAmount = ZeroEx.toBaseUnitAmount(new BigNumber(price).times(amount), 18);
    takerTokenAmount = ZeroEx.toBaseUnitAmount(new BigNumber(amount), 18);
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
      resourceName: 'orders',
      id: orderHash,
      attributes: order,
      relationships: {},
    }));
    yield put(reset('BuySellForm'));
  } catch (e) {
    yield put(sendNotification({ message: e.message, type: 'error' }));
    console.error(e);
  }
}

export function* fillOrder({ payload }) {
  const { zeroEx } = window;
  const currentToken = yield select(getCurrentToken);
  const currentPair = yield select(getCurrentPair);
  const address = yield select(getAddress);
  try {
    const txHash = yield zeroEx.exchange.fillOrderAsync(
      payload,
      payload.takerTokenAmount,
      true, // shouldThrowOnInsufficientBalanceOrAllowance
      address, // takerAddress
    );
    const txReceipt = yield zeroEx.awaitTransactionMinedAsync(txHash);
    console.log(txReceipt);
  } catch (e) {
    yield put(sendNotification({ message: e.message, type: 'error' }));
    console.error(e);
  }
}

export function* listenNewOrder() {
  yield takeEvery(types.CREATE_ORDER, createOrder);
}

export function* listFillOrder() {
  yield takeEvery(types.FILL_ORDER, fillOrder);
}
