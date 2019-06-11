import chai from 'chai';

import {
  createOrder,
} from './utils';

import {
  sortOrderbook,
} from '../endpoints/orderBook';

const { expect } = chai;

const params = [
  {
    makerAssetAmount: 10,
    takerAssetAmount: 7,
    takerFee: '400',
    expirationTime: 1000,
    sortPlace: 2,
  },
  {
    makerAssetAmount: 10,
    takerAssetAmount: 7,
    takerFee: '400',
    expirationTime: 2000,
    sortPlace: 3,
  },
  {
    makerAssetAmount: 10,
    takerAssetAmount: 7,
    takerFee: '800',
    sortPlace: 6,
  },
  {
    makerAssetAmount: 10,
    takerAssetAmount: 3,
    sortPlace: 0,
  },
  {
    makerAssetAmount: 10,
    takerAssetAmount: 7,
    takerFee: '400',
    expirationTime: 3000,
    sortPlace: 4,
  },
  {
    makerAssetAmount: 10,
    takerAssetAmount: 7,
    takerFee: '600',
    sortPlace: 5,
  },
  {
    makerAssetAmount: 10,
    takerAssetAmount: 5,
    sortPlace: 1,
  },

];

describe('OrderbookSortFunction', () => {
  it('should check if sort function filter orders correctly', async () => {
    const generatedOrders = await Promise.all(params.map(param => createOrder(param)));
    generatedOrders.sort(sortOrderbook);
    expect(generatedOrders[0].sortPlace).to.equal(0);
    expect(generatedOrders[1].sortPlace).to.equal(1);
    expect(generatedOrders[2].sortPlace).to.equal(2);
    expect(generatedOrders[3].sortPlace).to.equal(3);
    expect(generatedOrders[4].sortPlace).to.equal(4);
    expect(generatedOrders[5].sortPlace).to.equal(5);
    expect(generatedOrders[6].sortPlace).to.equal(6);
  });
});
