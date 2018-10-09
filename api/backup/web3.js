import { ZeroEx } from '0x.js';
import moment from 'moment';
import { appLogger as logger } from './utils/logger';
import BigNumber from './utils/BigNumber';
import { tokens, orders } from './models';
import socket from './socket';

const Web3 = require('web3');

// Amount big enough for fee
export const SMALLEST_AMOUNT = 0.005;
export const BIGGEST_AMOUNT = 1;
// Hardcoded - around 1$ for now ($400/eth)
export const TRANSACTION_FEE = 0.0025;
// Percentage fee (0.3%)
export const EXCHANGE_FEE = 0;
// Maximum number of mached orders (gasLimit issue)
export const MAX_NUM_ORDERS = 25;
// Maximum wait time for transaction
export const MAX_WAIT_TIME = 600000;
// export const MAX_WAIT_TIME = process.env.NODE_ENV === 'production' ? 600000 : 60000;

// to access node on local host you need to create SSH tunnel to parity-node aws server
export const providerUrl = process.env.NODE_ENV === 'production' ? 'http://13.57.48.254:8545' : 'http://localhost:8545';
export const provider = new Web3.providers.HttpProvider(providerUrl);
export const web3 = new Web3(provider);
export const zeroEx = new ZeroEx(provider, {
  // 42 is Kovan, 50 is local testnet
  networkId: process.env.NODE_ENV === 'production' ? 1 : 50
  // networkId: 1,
});

export const validateOrderAsync = order =>
  new Promise(async (resolve) => {
    try {
      await zeroEx.exchange.validateOrderFillableOrThrowAsync(formatZrxOrder(order.attributes.zrxOrder));
      resolve({ order, isValid: true });
    } catch (e) {
      console.log(e);
      logger.log('error', 'Order invalidated %j', e);
      resolve({ order, isValid: false });
    }
  });

export const formatZrxOrder = order => ({
  ...order,
  makerTokenAmount: BigNumber(order.makerTokenAmount),
  takerTokenAmount: BigNumber(order.takerTokenAmount),
  expirationUnixTimestampSec: BigNumber(order.expirationUnixTimestampSec),
  makerFee: BigNumber(order.makerFee),
  takerFee: BigNumber(order.takerFee)
});

export const watcherPromise = new Promise((resolve) => {
  const watcher = zeroEx.createOrderStateWatcher({
    cleanupJobIntervalMs: 60000,
  });
  resolve(watcher);
});

watcherPromise.then((watcher) => {
  watcher.subscribe(async (err, state) => {
    if (err) {
      console.error('STATE WATCH', err);
      return;
    }

    console.log('new', state);

    if (!state.isValid) {
      const order = await orders.query((qb =>
        qb.where('order_hash', state.orderHash)
          .andWhere('completed_at', null)
          .andWhere('deleted_at', null)
          .andWhere('canceled_at', null)
      )).fetch();
      if (!order) return;

      logger.log('info', 'Invaldating: %j', state, order.id);
      await orders.forge({ id: order.attributes.id })
        .save({
          completed_at: moment().toISOString(),
          status: 'completed',
        });
      socket.io.emit('new_message', {
        matchedIds: [order.id],
        token: order.attributes.token_address,
      });
    }
  });
  return watcher;
});

export const checkFee = async (order) => {
  const {
    zrxOrder,
    total,
    amount,
    price,
    type,
    token_address,
    pair_address,
  } = order;
  const currentToken = await tokens.query({ where: { address: token_address } }).fetch();
  const currentPair = await tokens.query({ where: { address: pair_address } }).fetch();
  if (type === 'sell') {
    const feeAmount = BigNumber(total)
      .times(EXCHANGE_FEE)
      .add(TRANSACTION_FEE)
      .toFixed(12);
    const orderWithFee = ZeroEx.toUnitAmount(
      BigNumber(zrxOrder.takerTokenAmount),
      currentPair.attributes.decimals
    ).add(feeAmount);
    return BigNumber(orderWithFee).eq(total);
  }
  const feeAmount = BigNumber(amount)
    .times(EXCHANGE_FEE)
    .add(BigNumber(TRANSACTION_FEE).div(price).toFixed(8))
    .toFixed(8);
  const fee = ZeroEx.toUnitAmount(
    BigNumber(zrxOrder.takerTokenAmount), currentToken.attributes.decimals
  ).add(feeAmount);
  return BigNumber(fee).eq(amount);
};
