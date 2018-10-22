import chai from 'chai';
import {
  SchemaValidator,
  schemas,
} from '@0xproject/json-schemas';

import {
  request,
  createOrder,
} from './utils';
import {
  Order,
} from '../../db';

const validator = new SchemaValidator();
const { expect } = chai;

const baseAssetData = '0xf47261b0000000000000000000000000871dd7c2b4b25e1aa18728e9d5f2af4c4e431f5c';
const quoteAssetData = '0xf47261b00000000000000000000000000b1ba0af832d7c05fd64161e0db78e85978e8082';

const params = [
  {
    baseAssetData,
    quoteAssetData,
  },
  {
    baseAssetData,
    quoteAssetData,
  },
  {
    baseAssetData,
    quoteAssetData,
  },
  {
    baseAssetData: quoteAssetData,
    quoteAssetData: baseAssetData,
  },
  {
    baseAssetData: quoteAssetData,
    quoteAssetData: baseAssetData,
  },
  {
    baseAssetData: quoteAssetData,
    quoteAssetData: baseAssetData,
  },
];

describe('Orderbook', () => {
  before(async () => {
    await Promise.all(params.map(async param => request
      .post('/v2/order')
      .send(createOrder(param))));
  });

  after(async () => {
    await Order.deleteMany({});
  });

  it('should return valid orderbook response', async () => {
    const response = await request
      .get('/v2/orderbook')
      .query({
        baseAssetData,
        quoteAssetData,
      });

    expect(
      validator.isValid(
        response.body,
        schemas.relayerApiOrderbookResponseSchema,
      ),
    ).to.equal(true);
  });

  it('should return orderbook filtered by baseAssetData and quoteAssetData', async () => {
    const response = await request
      .get('/v2/orderbook')
      .query({
        baseAssetData,
        quoteAssetData,
      });
    const bidsRecords = response.body.bids.records;
    const askRecords = response.body.asks.records;

    expect(
      bidsRecords.every(
        record => record.order.takerAssetData === baseAssetData,
      ),
    ).to.equal(true);
    expect(
      bidsRecords.every(
        record => record.order.makerAssetData === quoteAssetData,
      ),
    ).to.equal(true);
    expect(
      askRecords.every(
        record => record.order.takerAssetData === quoteAssetData,
      ),
    ).to.equal(true);
    expect(
      askRecords.every(
        record => record.order.makerAssetData === baseAssetData,
      ),
    ).to.equal(true);
  });

  it('should return correctly paginated bids and ask records', async () => {
    const page = 1;
    const perPage = 2;
    const firstResponse = await request
      .get('/v2/orderbook')
      .query({
        baseAssetData,
        quoteAssetData,
        page,
        perPage,
      });
    const secondResponse = await request
      .get('/v2/orderbook')
      .query({
        baseAssetData,
        quoteAssetData,
        page: 2,
        perPage: 1,
      });

    expect(
      firstResponse.body.bids.records[1],
    ).to.eql(secondResponse.body.bids.records[0]);
    expect(
      firstResponse.body.asks.records[1],
    ).to.eql(secondResponse.body.asks.records[0]);
    expect(
      firstResponse.body.bids.records.length,
    ).to.equal(perPage);
    expect(
      firstResponse.body.asks.records.length,
    ).to.equal(perPage);
  });
});
