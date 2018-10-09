import {
  uniq,
} from 'lodash';
import moment from 'moment';
import jobs from './jobs';
import {
  orders,
  tokens,
} from '../models';
import updateOrders from '../api/engine/updater';
import {
  updateTradingInfo,
} from '../api/trading';
import socket from '../socket';
import {
  appLogger as logger,
} from '../utils/logger';
import {
  catchError,
} from '../utils/helpers';
import { zeroEx } from '../web3';
import { pgBookshelf as pg } from '../db';

const ordersCollection = pg.Collection.extend({
  model: orders
});

jobs.process('UpdateQueue', 100, async (job, done) => {
  logger.log('info', '%s', job.type);
  const { orderAttributes, filledOrders, txHash } = job.data;

  // setting pending status for to-be filled orde rs
  if (process.env.NODE_ENV !== 'test') {
    await ordersCollection
      .forge(
        filledOrders.map(order => ({
          ...order,
          status: 'pending'
        }))
      )
      .invokeThen('save');
    // Send updated orders to everyone (with pending status)
    socket.io.emit('new_message', {
      matchedIds: filledOrders.map(order => order.id),
      token: orderAttributes.token_address,
    });
  }
  await zeroEx.awaitTransactionMinedAsync(txHash);

  const currentToken = await tokens.query({ where: { address: orderAttributes.token_address } }).fetch();
  const currentPair = await tokens.query({ where: { address: orderAttributes.pair_address } }).fetch();

  let updatedIds = [];
  try {
    updatedIds = await updateOrders({
      mainOrder: orderAttributes,
      filledOrders,
      tokenDecimals: currentToken.get('decimals'),
      pairDecimals: currentPair.get('decimals'),
      txHash,
    });
  } catch (e) {
    logger.log('error', 'Updating order error %s', e);
    catchError(e);
    done(e);
  }

  if (!updatedIds.length) {
    done();
    return;
  }

  const completedMatchedOrders = await orders
    .query((qb) => {
      qb.whereIn('id', updatedIds).andWhere((qb) => {
        qb.whereNotNull('completed_at').andWhere('is_history', true);
      });
    })
    .orderBy('completed_at', '<=')
    .fetchAll();

  const addresses = uniq(completedMatchedOrders.toArray().map(order => order.get('maker_address')));

  logger.log('info', 'Sending messages to %s', addresses);

  // Send message to order creators
  addresses.forEach((address) => {
    socket.io.to(address).emit('new_message', {
      message: 'Found matched order',
    });
  });

  // Send updated orders to everyone
  socket.io.emit('new_message', {
    matchedIds: updatedIds,
    token: currentToken.id,
  });

  const bars = completedMatchedOrders.toArray().map(order => ({
    time: moment(order.get('completed_at')).unix() * 1000,
    open: parseFloat(order.get('price')),
    close: parseFloat(order.get('price')),
    volume: parseFloat(order.get('amount')),
    low: parseFloat(order.get('price')),
    high: parseFloat(order.get('price')),
  }));

  bars.forEach((bar) => {
    socket.io.emit('updated_bar', {
      bar,
      token: currentToken.id,
    });
  });

  await updateTradingInfo(completedMatchedOrders.toArray());

  done();
});
