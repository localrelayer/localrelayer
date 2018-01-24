import {
  takeEvery,
} from 'redux-saga';
import { ZeroEx } from '0x.js';
import * as BigNumber from 'bignumber.js';
import * as types from '../actions/types';

export function* createOrder() {
  const { zeroEx } = window;
  const { NULL_ADDRESS } = ZeroEx;
  const WETH_ADDRESS = yield zeroEx.etherToken.getContractAddressAsync();
  const ZRX_ADDRESS = yield zeroEx.exchange.getZRXTokenAddressAsync();
  const EXCHANGE_ADDRESS = yield zeroEx.exchange.getContractAddressAsync();
  const order = {
    maker: '0x5409ED021D9299bf6814279A6A1411A7e866A631',
    taker: NULL_ADDRESS,
    feeRecipient: NULL_ADDRESS,
    makerTokenAddress: ZRX_ADDRESS,
    takerTokenAddress: WETH_ADDRESS,
    exchangeContractAddress: EXCHANGE_ADDRESS,
    salt: ZeroEx.generatePseudoRandomSalt(),
    makerFee: new BigNumber(0),
    takerFee: new BigNumber(0),
    makerTokenAmount: ZeroEx.toBaseUnitAmount(new BigNumber(0.2), 18),
    takerTokenAmount: ZeroEx.toBaseUnitAmount(new BigNumber(0.3), 18),
    expirationUnixTimestampSec: new BigNumber(Date.now() + 3600000),
  };
}

export function* watchNewOrder() {
  yield takeEvery(types.CREATE_ORDER, createOrder);
}
