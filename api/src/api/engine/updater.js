import { ZeroEx } from '0x.js';
import moment from 'moment';
import {
  omit,
  flatten,
} from 'lodash';
import { orders } from '../../models';
import BigNumber from '../../utils/BigNumber';
import { pgBookshelf as pg } from '../../db';
import {
  SMALLEST_AMOUNT,
  formatZrxOrder,
  zeroEx,
  watcherPromise,
} from '../../web3';

const ordersCollection = pg.Collection.extend({
  model: orders
});

const updateMatchedOrders = async ({ mainOrder, filledOrders, tokenDecimals, pairDecimals, txHash }) => {
  // Create completed order from order attributes
  // Check filled amount in other orders and either complete them either update

  // console.log('Creating order for history');

  const historyOrderId = await orders
    .forge({
      ...mainOrder,
      created_at: moment().toISOString(),
      completed_at: moment().toISOString(),
      status: 'completed',
      is_history: true,
      tx_hash: txHash
    })
    .save()
    .then(o => o.attributes.id);

  const matchedIds = await Promise.all(filledOrders.map(async (o) => {
    const unavailableAmount = await zeroEx.exchange.getUnavailableTakerAmountAsync(o.order_hash);

    console.log('ZRX FILLED', unavailableAmount.toNumber());

    console.log('TAKER AMOUNT BEFORE', o.zrxOrder.takerTokenAmount);
    console.log('MAKER AMOUNT BEFORE', o.zrxOrder.makerTokenAmount);

    console.log('ORDER TYPE', o.type);

    const leftTakerAmount = BigNumber(o.zrxOrder.takerTokenAmount).minus(unavailableAmount);
    const leftMakerAmount = (BigNumber(o.zrxOrder.makerTokenAmount).times(leftTakerAmount))
      .div(o.zrxOrder.takerTokenAmount).toFixed(0);

    const takerDecimals = o.type === 'buy' ? tokenDecimals : pairDecimals;
    const makerDecimals = o.type === 'buy' ? pairDecimals : tokenDecimals;

    const leftTakerAmountUnit = ZeroEx.toUnitAmount(BigNumber(leftTakerAmount), takerDecimals);
    const leftMakerAmountUnit = ZeroEx.toUnitAmount(BigNumber(leftMakerAmount), makerDecimals);

    console.log('LEFT AMOUNTS', leftTakerAmountUnit, leftMakerAmountUnit);

    const isFilled = BigNumber(leftTakerAmount).lte(SMALLEST_AMOUNT);

    if (!isFilled) {
      const newAmount = o.type === 'buy' ? leftTakerAmountUnit : leftMakerAmountUnit;
      const newTotal = BigNumber(newAmount).times(o.price);

      return ordersCollection
        .forge([
        // New Order
          {
            ...omit(o, ['id']),
            parent_id: o.id,
            amount: newAmount.toFixed(12),
            total: newTotal.toFixed(12),
            status: 'new',
            created_at: moment().toISOString()
          },
          // // Closed order
          // {
          //   ...omit(o, ['id']),
          //   parent_id: o.id,
          //   amount: filledAmount.toFixed(12),
          //   total: filledTotal.toFixed(12),
          //   created_at: moment().toISOString(),
          //   completed_at: moment().toISOString(),
          //   status: 'completed',
          //   tx_hash: txHash
          // }
        ])
        .invokeThen('save')
        .then(async ([order1]) => {
          const watcher = await watcherPromise;
          watcher.addOrder(formatZrxOrder(order1.attributes.zrxOrder));
          return orders
            .forge({ id: o.id })
            .save({
              child_id: order1.id,
              status: 'completed',
              completed_at: moment().toISOString(),
              tx_hash: txHash
            })
            .then(() => [o.id, order1.id]);
        }
        );
    }


    console.log('WHAT THE FUCKI', o);

    return orders
      .forge({ id: o.id })
      .save({
        completed_at: moment().toISOString(),
        status: 'completed',
        tx_hash: txHash
      })
      .then(() => [o.id]);
  }
  ));

  console.log(flatten([historyOrderId, ...matchedIds]));

  return flatten([historyOrderId, ...matchedIds]);
};

export default updateMatchedOrders;
