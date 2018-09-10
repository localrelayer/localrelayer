import chai from 'chai';
import { ZeroEx } from '0x.js';
import { createFillRequests } from '../src/api/engine/finder';
import { getSellOrder, getBuyOrder } from './utils';
import BigNumber from '../src/utils/BigNumber';

chai.should();

describe('Matcher', () => {
  it('should fill "Fully filled sell order"', async () => {
    const sellOrder = await getSellOrder(0.05, 5);
    // const sellOrderFee = getSellFeeAmount(0.05, 18);

    const buyOrder1 = await getBuyOrder(0.055, 1.25);
    // const buyOrder1Fee = getBuyFeeAmount(0.055, 1.25, 18);

    const buyOrder2 = await getBuyOrder(0.05, 2);
    // const buyOrder2Fee = getBuyFeeAmount(0.05, 2, 18);

    const buyOrder3 = await getBuyOrder(0.05, 25);
    // const buyOrder3Fee = getBuyFeeAmount(0.05, 25, 18);

    const fillRequests =
      await createFillRequests({
        order: sellOrder,
        matchedOrders: [buyOrder1, buyOrder2, buyOrder3],
      });
    const [sellOrderFill, buyOrder1Fill, buyOrder2Fill, buyOrder3Fill] = fillRequests;

    const sellOrderLeftTotal = BigNumber(sellOrder.attributes.total)
      .minus(ZeroEx.toUnitAmount(sellOrderFill.takerTokenFillAmountNoFee, 18));

    chai.assert(sellOrderLeftTotal.isZero(), true);

    const buyOrder1LeftAmount = BigNumber(buyOrder1.attributes.amount)
      .minus(ZeroEx.toUnitAmount(buyOrder1Fill.takerTokenFillAmountNoFee, 18));

    chai.assert(buyOrder1LeftAmount.isZero(), true);

    const buyOrder2LeftAmount = BigNumber(buyOrder2.attributes.amount)
      .minus(ZeroEx.toUnitAmount(buyOrder2Fill.takerTokenFillAmountNoFee, 18));

    chai.assert(buyOrder2LeftAmount.isZero(), true);

    const buyOrder3LeftAmount = BigNumber(buyOrder3.attributes.amount)
      .minus(ZeroEx.toUnitAmount(buyOrder3Fill.takerTokenFillAmountNoFee, 18));

    chai.assert(buyOrder3LeftAmount.eq(23.25), true);
  });

  it('should fill "Not fully filled sell order"', async () => {
    const sellOrder = await getSellOrder(0.05, 5);
    const buyOrder1 = await getBuyOrder(0.055, 1.25);
    const buyOrder2 = await getBuyOrder(0.05, 2);
    const buyOrder3 = await getBuyOrder(0.052, 1);

    const fillRequests =
    await createFillRequests({
      order: sellOrder,
      matchedOrders: [buyOrder1, buyOrder2, buyOrder3],
    });
    const [sellOrderFill, buyOrder1Fill, buyOrder2Fill, buyOrder3Fill] = fillRequests;
    const sellOrderLeftTotal = BigNumber(sellOrder.attributes.total)
      .minus(ZeroEx.toUnitAmount(sellOrderFill.takerTokenFillAmountNoFee, 18));

    chai.assert(sellOrderLeftTotal.eq(0.0375), true);

    const buyOrder1LeftAmount = BigNumber(buyOrder1.attributes.amount)
      .minus(ZeroEx.toUnitAmount(buyOrder1Fill.takerTokenFillAmountNoFee, 18));

    chai.assert(buyOrder1LeftAmount.isZero(), true);

    const buyOrder2LeftAmount = BigNumber(buyOrder2.attributes.amount)
      .minus(ZeroEx.toUnitAmount(buyOrder2Fill.takerTokenFillAmountNoFee, 18));

    chai.assert(buyOrder2LeftAmount.isZero(), true);

    const buyOrder3LeftAmount = BigNumber(buyOrder3.attributes.amount)
      .minus(ZeroEx.toUnitAmount(buyOrder3Fill.takerTokenFillAmountNoFee, 18));

    chai.assert(buyOrder3LeftAmount.isZero(), true);
  });

  it('should fill "Fully filled buy order"', async () => {
    const buyOrder = await getBuyOrder(0.051, 10);
    const sellOrder1 = await getSellOrder(0.05, 5);
    const sellOrder2 = await getSellOrder(0.049, 1.25);
    const sellOrder3 = await getSellOrder(0.046, 2);
    const sellOrder4 = await getSellOrder(0.05, 10);
    const fillRequests =
      await createFillRequests({
        order: buyOrder,
        matchedOrders: [sellOrder1, sellOrder2, sellOrder3, sellOrder4],
      });
    const [
      sellOrder1Fill,
      sellOrder2Fill,
      sellOrder3Fill,
      sellOrder4Fill,
      buyOrderFill,
    ] = fillRequests;

    const sellOrder1LeftTotal = BigNumber(sellOrder1.attributes.total)
      .minus(ZeroEx.toUnitAmount(sellOrder1Fill.takerTokenFillAmountNoFee, 18));

    chai.assert(sellOrder1LeftTotal.isZero(), true);

    const sellOrder2LeftTotal = BigNumber(sellOrder2.attributes.total)
      .minus(ZeroEx.toUnitAmount(sellOrder2Fill.takerTokenFillAmountNoFee, 18));

    chai.assert(sellOrder2LeftTotal.isZero(), true);

    const sellOrder3LeftTotal = BigNumber(sellOrder3.attributes.total)
      .minus(ZeroEx.toUnitAmount(sellOrder3Fill.takerTokenFillAmountNoFee, 18));

    chai.assert(sellOrder3LeftTotal.isZero(), true);

    const sellOrder4LeftTotal = BigNumber(sellOrder4.attributes.total)
      .minus(ZeroEx.toUnitAmount(sellOrder4Fill.takerTokenFillAmountNoFee, 18));

    chai.assert(sellOrder4LeftTotal.eq(0.4125), true);

    const buyOrderLeftAmount = BigNumber(buyOrder.attributes.amount)
      .minus(ZeroEx.toUnitAmount(buyOrderFill.takerTokenFillAmountNoFee, 18));

    chai.assert(buyOrderLeftAmount.isZero(), true);
  });

  it('should fill "Not fully filled buy order"', async () => {
    const buyOrder = await getBuyOrder(0.051, 10);
    const sellOrder1 = await getSellOrder(0.05, 5);
    const sellOrder2 = await getSellOrder(0.049, 0.75);
    const sellOrder3 = await getSellOrder(0.046, 1.5);
    const sellOrder4 = await getSellOrder(0.05, 2);
    const fillRequests =
      await createFillRequests({
        order: buyOrder,
        matchedOrders: [sellOrder1, sellOrder2, sellOrder3, sellOrder4],
      });
    const [
      sellOrder1Fill,
      sellOrder2Fill,
      sellOrder3Fill,
      sellOrder4Fill,
      buyOrderFill,
    ] = fillRequests;

    const sellOrder1LeftTotal = BigNumber(sellOrder1.attributes.total)
      .minus(ZeroEx.toUnitAmount(sellOrder1Fill.takerTokenFillAmountNoFee, 18));

    chai.assert(sellOrder1LeftTotal.isZero(), true);

    const sellOrder2LeftTotal = BigNumber(sellOrder2.attributes.total)
      .minus(ZeroEx.toUnitAmount(sellOrder2Fill.takerTokenFillAmountNoFee, 18));

    chai.assert(sellOrder2LeftTotal.isZero(), true);

    const sellOrder3LeftTotal = BigNumber(sellOrder3.attributes.total)
      .minus(ZeroEx.toUnitAmount(sellOrder3Fill.takerTokenFillAmountNoFee, 18));

    chai.assert(sellOrder3LeftTotal.isZero(), true);

    const sellOrder4LeftTotal = BigNumber(sellOrder4.attributes.total)
      .minus(ZeroEx.toUnitAmount(sellOrder4Fill.takerTokenFillAmountNoFee, 18));

    chai.assert(sellOrder4LeftTotal.isZero(), true);

    const buyOrderLeftAmount = BigNumber(buyOrder.attributes.amount)
      .minus(ZeroEx.toUnitAmount(buyOrderFill.takerTokenFillAmountNoFee, 18));

    chai.assert(buyOrderLeftAmount.eq(0.75), true);
  });


  // it('stress test', async () => {
  //   const buyOrder = await getBuyOrder(0.0051, 1000);
  //   const sellOrders = await Promise.all(Array.from(Array(50).keys()).map(() => getSellOrder(0.0051, 5)));
  //   const fillRequests =
  //     await batchFillOrders({
  //       order: buyOrder,
  //       matchedOrders: sellOrders,
  //       tokenDecimals: 18,
  //       pairDecimals: 18,
  //     });
  // });
});
