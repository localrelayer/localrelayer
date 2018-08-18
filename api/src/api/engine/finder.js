import { ZeroEx } from '0x.js';
import moment from 'moment';
import BigNumber from '../../utils/BigNumber';
import { appLogger as logger } from '../../utils/logger';
import { orders, tokens } from '../../models';
import {
  formatZrxOrder,
  validateOrderAsync,
  SMALLEST_AMOUNT,
  TRANSACTION_FEE,
  EXCHANGE_FEE,
} from '../../web3';
import { pgBookshelf as pg } from '../../db';
import socket from '../../socket';

const ordersCollection = pg.Collection.extend({
  model: orders
});

export default async (order) => {
  // Safe check for order amount being higher than smallest
  if (BigNumber(order.attributes.total).lt(SMALLEST_AMOUNT)) {
    logger.log('error', 'Order total is too small');
    orders.forge({ id: order.attributes.id }).save({
      status: 'canceled',
      canceled_at: moment().toISOString()
    });
    return [];
  }

  const isOrderValid = await validateOrderAsync(order);
  if (!isOrderValid) {
    logger.log('error', 'Incoming order is invalid');
    orders.forge({ id: order.attributes.id }).save({
      status: 'canceled',
      canceled_at: moment().toISOString()
    });
    return [];
  }

  // If 'buy' we want to get orders with less or equal price and vice versa
  const comparator = order.attributes.type === 'buy' ? '<=' : '>=';
  // If 'buy' we want to get a cheapest sell and vice versa
  const sorter = order.attributes.type === 'buy' ? 'ASC' : 'DESC';

  // Finding matching order
  const matchedOrders = await orders
    .query((qb) => {
      qb
        .where('price', comparator, order.attributes.price)
        .andWhere('type', '!=', order.attributes.type)
        .andWhere('token_address', order.attributes.token_address)
        .andWhere('pair_address', order.attributes.pair_address)
        .andWhere('child_id', null)
        .andWhere('status', 'new')
        .andWhere('completed_at', null)
        .andWhere('deleted_at', null)
        .andWhere('canceled_at', null);
    })
    .orderBy('price', sorter)
    .fetchAll();

  if (!matchedOrders.length) {
    logger.log('warn', 'No match');
    return [];
  }

  // Checking zrxOrders validity (with help of 0x.js)

  const validatedMatchedOrders = await Promise.all(matchedOrders.toArray().map(order => validateOrderAsync(order)));

  const invalidOrders = validatedMatchedOrders.filter(item => !item.isValid).map(item => item.order);

  if (process.env.NODE_ENV !== 'test') {
    try {
      await ordersCollection
        .forge(
          invalidOrders.map(order => ({
            ...order.attributes,
            canceled_at: moment().toISOString(),
            status: 'canceled'
          }))
        )
        .invokeThen('save');
      if (invalidOrders.length > 0) {
        socket.io.emit('new_message', {
          matchedIds: invalidOrders.map(order => order.attributes.id),
          token: order.attributes.token_address,
        });
      }
    } catch (e) {
      logger.log('error', 'Cant set invalid orders');
    }
  }

  const validMatchedOrders = validatedMatchedOrders.filter(item => item.isValid).map(item => item.order);

  if (!validMatchedOrders.length) {
    logger.log('warn', 'No valid orders');
    return [];
  }
  // Creating filling requests
  return validMatchedOrders;
  // const fillRequests = await createFillRequests({ order, matchedOrders: validMatchedOrders });
  // return fillRequests;
};

export const createFillRequests = async ({ order, matchedOrders }) => {
  const fillRequests = [];
  const token = await tokens.query({ where: { address: order.attributes.token_address } }).fetch();
  const pair = await tokens.query({ where: { address: order.attributes.pair_address } }).fetch();
  const tokenDecimals = token.attributes.decimals;
  const pairDecimals = pair.attributes.decimals;

  const getSellMakerAmount = order => ZeroEx.toBaseUnitAmount(BigNumber(order.attributes.amount), tokenDecimals);
  const getSellTakerAmount = order => ZeroEx.toBaseUnitAmount(BigNumber(order.attributes.total), pairDecimals);
  const getBuyTakerAmount = order => ZeroEx.toBaseUnitAmount(BigNumber(order.attributes.amount), tokenDecimals);

  if (order.attributes.type === 'sell') {
    const orderMakerAmount = getSellMakerAmount(order);
    const orderTakerAmount = getSellTakerAmount(order);
    let makerAmountNeeded = orderMakerAmount;

    logger.log('info', 'SELL ORDER NEEDED AMOUNT: %j', makerAmountNeeded);

    while (BigNumber(makerAmountNeeded).gt(0) && matchedOrders.length > 0) {
      const matchedOrder = matchedOrders.shift();
      const matchedOrderTakerAmount = getBuyTakerAmount(matchedOrder);

      if (makerAmountNeeded.gte(matchedOrderTakerAmount)) {
        logger.log('info', 'FOUND SMALLER OR EQUAL ORDER: %j', matchedOrderTakerAmount);

        fillRequests.push({
          signedOrder: formatZrxOrder(matchedOrder.attributes.zrxOrder),
          attributes: matchedOrder.attributes,
          takerTokenFillAmount: getBuyAmountWithFee(
            matchedOrderTakerAmount,
            matchedOrder.attributes.price,
            tokenDecimals
          ),
          takerTokenFillAmountNoFee: matchedOrderTakerAmount
        });

        makerAmountNeeded = makerAmountNeeded.minus(matchedOrderTakerAmount);

        logger.log('info', 'NOW NEEDED AMOUNT IS: %j', makerAmountNeeded);
      } else {
        logger.log('info', 'FOUND BIGGER ORDER: %j', matchedOrderTakerAmount);

        fillRequests.push({
          signedOrder: formatZrxOrder(matchedOrder.attributes.zrxOrder),
          attributes: matchedOrder.attributes,
          takerTokenFillAmount: getBuyAmountWithFee(makerAmountNeeded, matchedOrder.attributes.price, tokenDecimals),
          takerTokenFillAmountNoFee: makerAmountNeeded
        });
        logger.log('info', 'SO WE JUST TAKE ALL WE NEED: %j', makerAmountNeeded);
        makerAmountNeeded = BigNumber(0);
      }
    }

    const notFilledOrderTakerTokenAmount = BigNumber(
      fillRequests
        .reduce((total, req) => total.add(req.takerTokenFillAmountNoFee), BigNumber(0))
        .times(orderTakerAmount)
        .div(orderMakerAmount)
        .toFixed(0)
    );

    logger.log(
      'info',
      'TOTAL TAKER AMOUNT FROM ORDERS IS: %j',
      fillRequests.reduce((total, req) => total.add(req.takerTokenFillAmountNoFee), BigNumber(0))
    );

    logger.log('info', 'NO FILLED TAKER AMOUNT IS: %j', notFilledOrderTakerTokenAmount);

    const orderTakerTokenFillAmount = makerAmountNeeded.isZero()
      ? BigNumber(orderTakerAmount)
      : notFilledOrderTakerTokenAmount;

    logger.log('info', 'WE NEED TO FILL MAIN ORDER WITH: %j', orderTakerTokenFillAmount);

    fillRequests.unshift({
      signedOrder: formatZrxOrder(order.attributes.zrxOrder),
      attributes: order.attributes,
      takerTokenFillAmount: getSellAmountWithFee(orderTakerTokenFillAmount, pairDecimals),
      takerTokenFillAmountNoFee: orderTakerTokenFillAmount,
      isMainOrder: true,
    });
  } else {
    const orderTakerAmount = getBuyTakerAmount(order);
    let takerAmountNeeded = orderTakerAmount;

    logger.log('info', 'BUY ORDER OFFERED AMOUNT: %j', takerAmountNeeded);

    let notFilledOrderTakerTokenAmount = BigNumber(0);
    while (BigNumber(takerAmountNeeded).gt(0) && matchedOrders.length > 0) {
      const matchedOrder = matchedOrders.shift();
      const matchedOrderMakerAmount = getSellMakerAmount(matchedOrder);
      const matchedOrderTakerAmount = getSellTakerAmount(matchedOrder);

      if (takerAmountNeeded.gte(matchedOrderMakerAmount)) {
        logger.log('info', 'SMALLER OR EQUAL ORDER: %j', matchedOrderMakerAmount);

        fillRequests.push({
          signedOrder: formatZrxOrder(matchedOrder.attributes.zrxOrder),
          attributes: matchedOrder.attributes,
          takerTokenFillAmount: getSellAmountWithFee(matchedOrderTakerAmount, pairDecimals),
          takerTokenFillAmountNoFee: matchedOrderTakerAmount
        });
        notFilledOrderTakerTokenAmount = notFilledOrderTakerTokenAmount.add(matchedOrderMakerAmount);

        logger.log('info', 'NOT FILLED AMOUNT: %j', notFilledOrderTakerTokenAmount);

        takerAmountNeeded = takerAmountNeeded.minus(matchedOrderMakerAmount);

        logger.log('info', 'OFFERED AMOUNT NOW IS: %j', takerAmountNeeded);
      } else {
        const takerTokenFillAmount = takerAmountNeeded.times(matchedOrderTakerAmount).div(matchedOrderMakerAmount);

        logger.log('info', 'BIGGER ORDER FROM WHICH WE WILL TAKE: %j', takerTokenFillAmount);

        fillRequests.push({
          signedOrder: formatZrxOrder(matchedOrder.attributes.zrxOrder),
          attributes: matchedOrder.attributes,
          takerTokenFillAmount: getSellAmountWithFee(takerTokenFillAmount, pairDecimals),
          takerTokenFillAmountNoFee: takerTokenFillAmount
        });
        // Just in case, such case shouldn't happen anyway
        notFilledOrderTakerTokenAmount = notFilledOrderTakerTokenAmount.add(takerAmountNeeded);

        logger.log('info', "NOW WE NEED TO FILL (BUT PROBABLY WON'T): %j", notFilledOrderTakerTokenAmount);

        takerAmountNeeded = BigNumber(0);
      }
    }
    const orderTakerTokenFillAmount = takerAmountNeeded.isZero()
      ? BigNumber(orderTakerAmount)
      : notFilledOrderTakerTokenAmount;

    logger.log('info', 'THIS IS HOW MUCH WE SHOULD PAY: %j', orderTakerTokenFillAmount);

    fillRequests.push({
      signedOrder: formatZrxOrder(order.attributes.zrxOrder),
      attributes: order.attributes,
      takerTokenFillAmount: getBuyAmountWithFee(orderTakerTokenFillAmount, order.attributes.price, tokenDecimals),
      takerTokenFillAmountNoFee: orderTakerTokenFillAmount,
      isMainOrder: true,
    });
  }

  // setting pending status for to-be filled orders
  // if (process.env.NODE_ENV !== 'test') {
  //   await ordersCollection
  //     .forge(
  //       fillRequests.map(order => ({
  //         ...order.attributes,
  //         status: 'pending'
  //       }))
  //     )
  //     .invokeThen('save');
  //   // Send updated orders to everyone (with pending status)
  //   socket.io.emit('new_message', {
  //     matchedIds: fillRequests.map(order => order.attributes.id),
  //     token: order.attributes.token_address,
  //   });
  // }

  console.log(fillRequests.map(request => request.takerTokenFillAmount.toString()));
  return fillRequests;
};

// Amount is in base units (depends on decimals)
const getBuyFeeAmount = (amount, price, tokenDecimals) => {
  const fee = BigNumber(BigNumber(TRANSACTION_FEE).div(price).toFixed(8)).toFixed(8);

  return BigNumber(amount)
    .times(EXCHANGE_FEE)
    .add(ZeroEx.toBaseUnitAmount(BigNumber(fee), tokenDecimals));
};

const getBuyAmountWithFee = (amount, price, tokenDecimals) =>
  BigNumber(amount).minus(getBuyFeeAmount(amount, price, tokenDecimals));

const getSellFeeAmount = (amount, pairDecimals) =>
  BigNumber(amount)
    .times(EXCHANGE_FEE)
    .add(ZeroEx.toBaseUnitAmount(BigNumber(TRANSACTION_FEE), pairDecimals))
    .toFixed(8);

const getSellAmountWithFee = (amount, pairDecimals) =>
  BigNumber(amount).minus(getSellFeeAmount(amount, pairDecimals));
