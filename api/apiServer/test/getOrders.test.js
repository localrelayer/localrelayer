import chai from 'chai';
import {
  SchemaValidator,
  schemas,
} from '@0x/json-schemas';

import {
  request,
  createOrder,
} from './utils';
import {
  Order,
} from '../../db';

const validator = new SchemaValidator();
const { expect } = chai;

const makerAddress = '0x6ecbe1db9ef729cbe972c83fb886247691fb6beb';
const exchangeAddress = '0x48bacb9266a570d521063ef5dd96e61686dbe788';
const makerAssetData = '0xf47261b00000000000000000000000000b1ba0af832d7c05fd64161e0db78e85978e8082';
const takerAssetData = '0xf47261b0000000000000000000000000871dd7c2b4b25e1aa18728e9d5f2af4c4e431f5c';
const params = [
  {
    makerAssetAmount: '0.5',
    quoteAssetData: makerAssetData,
    baseAssetData: takerAssetData,
  },
  {
    makerAssetAmount: '1',
    quoteAssetData: makerAssetData,
    baseAssetData: takerAssetData,
  },
  {
    makerAssetAmount: '0.33',
    quoteAssetData: makerAssetData,
    baseAssetData: takerAssetData,
  },
];

describe('Orders', () => {
  before(async () => {
    await Promise.all(params.map(async (param) => {
      const order = await createOrder(param);
      const res = await request
        .post('/v2/order')
        .query({
          networkId: 50,
        })
        .send(order);
      return res;
    }));
  });

  after(async () => {
    await Order.deleteMany();
  });

  it('should return valid response', async () => {
    const response = await request
      .get('/v2/orders')
      .query({
        networkId: 50,
      });
    expect(
      validator.isValid(
        response.body,
        schemas.relayerApiOrdersResponseSchema,
      ),
    ).to.equal(true);
  });

  it('should return correctly paginated response', async () => {
    const page = 1;
    const perPage = 2;
    const firstResponse = await request
      .get('/v2/orders')
      .query({
        page,
        perPage,
        networkId: 50,
      });
    const secondResponse = await request
      .get('/v2/orders')
      .query({
        page: 2,
        perPage: 1,
        networkId: 50,
      });
    const firstResponseRecords = firstResponse.body.records;
    const secondResponseRecords = secondResponse.body.records;

    expect(firstResponseRecords[1]).to.eql(secondResponseRecords[0]);
    expect(firstResponseRecords.length).to.equal(perPage);
  });

  it('should return correctly paginated response with filter', async () => {
    const page = 1;
    const perPage = 2;
    const firstResponse = await request
      .get('/v2/orders')
      .query({
        exchangeAddress,
        page,
        perPage,
        networkId: 50,
      });
    const secondResponse = await request
      .get('/v2/orders')
      .query({
        exchangeAddress,
        page: 2,
        perPage: 1,
        networkId: 50,
      });
    const firstResponseRecords = firstResponse.body.records;
    const secondResponseRecords = secondResponse.body.records;

    expect(
      firstResponseRecords.every(
        record => record.order.exchangeAddress === exchangeAddress,
      ),
    ).to.equal(true);
    expect(
      secondResponseRecords.every(
        record => record.order.exchangeAddress === exchangeAddress,
      ),
    ).to.equal(true);
    expect(firstResponseRecords[1]).to.eql(secondResponseRecords[0]);
    expect(firstResponseRecords.length).to.equal(perPage);
  });

  it('should return response filtered by makerAddress', async () => {
    const response = await request
      .get('/v2/orders')
      .query({
        makerAddress,
        networkId: 50,
      });
    const responseRecords = response.body.records;

    expect(
      responseRecords.every(record => record.order.makerAddress === makerAddress),
    ).to.equal(true);
  });

  it('should return response filtered by traderAssetData', async () => {
    const response = await request
      .get('/v2/orders')
      .query({
        traderAssetData: makerAssetData,
        networkId: 50,
      });
    const responseRecords = response.body.records;

    expect(
      responseRecords.every(
        record => record.order.makerAssetData === makerAssetData,
      ),
    );
  });

  it('should return response filtered by traderAssetData and traderAssetAmount', async () => {
    const response = await request
      .get('/v2/orders')
      .query({
        traderAssetData: makerAssetData,
        traderAddress: makerAddress,
        networkId: 50,
      });
    const responseRecords = response.body.records;

    expect(
      responseRecords.every(
        record => record.order.makerAssetData === makerAssetData,
      ),
    );
    expect(
      responseRecords.every(
        record => record.order.makerAddress === makerAddress,
      ),
    );
  });

  it('should return sorted response filtered by makerAssetData and takerAssetData', async () => {
    const response = await request
      .get('/v2/orders')
      .query({
        makerAssetData,
        takerAssetData,
        networkId: 50,
      });
    const { records } = response.body;
    expect(
      records[0].order.takerAssetAmount / records[0].order.makerAssetAmount
      <= records[1].order.takerAssetAmount / records[1].order.makerAssetAmount,
    ).to.equal(true);
    expect(
      records[1].order.takerAssetAmount / records[1].order.makerAssetAmount
      <= records[2].order.takerAssetAmount / records[2].order.makerAssetAmount,
    ).to.equal(true);
  });
});
