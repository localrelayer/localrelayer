import {
  SchemaValidator,
  schemas,
} from '@0x/json-schemas';

import {
  coreMocks,
} from 'instex-core';

const makerAssetData = '0xf47261b0000000000000000000000000e41d2489571d322189246dafa5ebde1f4699f498'; /* ZRX */
const takerAssetData = '0xf47261b0000000000000000000000000c02aaa39b223fe8d0a0e5c4f27ead9083c756cc2'; /* WETH */


test('getOrders: validate getOrders response schema', () => {
  const validator = new SchemaValidator();
  const api = coreMocks.mocksOrdersFactory();
  const result = validator.validate(
    api.getOrders({
      page: 1,
      perPage: 1,
    }),
    schemas.relayerApiOrdersResponseSchema,
  );
  const { errors } = result;
  if (errors.length) {
    console.log(result);
  }

  expect(errors.length).toBe(0);
});

test('getOrders: pagination', () => {
  const api = coreMocks.mocksOrdersFactory({
    qty: {
      bids: 2,
      asks: 2,
    },
  });
  const allOrders = api.getOrders({
    page: 1,
    perPage: 2,
  });
  const page = 2;
  const perPage = 1;
  const paginatedOrders = api.getOrders({
    page,
    perPage,
  });
  const offsetToCheckLastPage = (page - 1) * perPage;
  const testRecordFromPage = paginatedOrders.records[0];
  const testRecordFromAll = allOrders.records[offsetToCheckLastPage];

  expect(testRecordFromPage).toMatchObject(testRecordFromAll);
  expect(testRecordFromPage).toMatchObject(testRecordFromAll);
});

test('getOrders: pagination with filter', () => {
  const api = coreMocks.mocksOrdersFactory({
    assetDataA: makerAssetData,
    qty: {
      bids: 2,
      asks: 2,
    },
  });
  const allOrders = api.getOrders({
    makerAssetData,
    page: 1,
    perPage: 2,
  });
  const page = 2;
  const perPage = 1;
  const paginatedOrders = api.getOrders({
    makerAssetData,
    page,
    perPage,
  });
  const offsetToCheckLastPage = (page - 1) * perPage;
  const testRecordFromPage = paginatedOrders.records[0];
  const testRecordFromAll = allOrders.records[offsetToCheckLastPage];

  expect(testRecordFromPage).toMatchObject(testRecordFromAll);
  expect(testRecordFromPage).toMatchObject(testRecordFromAll);
});

test('getOrders: filter makerAssetData', () => {
  const orders = coreMocks.mocksOrdersFactory({
    assetDataA: makerAssetData,
  }).getOrders({
    makerAssetData,
  });

  const assets = {
    makers: orders.records.map(r => r.order.makerAssetData),
  };

  expect(
    assets.makers
      .every(
        assetData => (
          assetData === makerAssetData
        ),
      ),
  ).toBe(true);
});

test('getOrders: filter takerAssetData', () => {
  const orders = coreMocks.mocksOrdersFactory({
    assetDataB: takerAssetData,
  }).getOrders({
    takerAssetData,
  });

  const assets = {
    takers: orders.records.map(r => r.order.takerAssetData),
  };

  expect(
    assets.takers
      .every(
        assetData => (
          assetData === takerAssetData
        ),
      ),
  ).toBe(true);
});

test('getOrders: filter makerAssetData and takerAssetData fields', () => {
  const orders = coreMocks.mocksOrdersFactory({
    assetDataA: makerAssetData,
    assetDataB: takerAssetData,
  }).getOrders({
    makerAssetData,
    takerAssetData,
  });

  const assets = {
    makers: orders.records.map(r => r.order.makerAssetData),
    takers: orders.records.map(r => r.order.takerAssetData),
  };

  expect(
    assets.makers
      .every(
        assetData => (
          assetData === makerAssetData
        ),
      ),
  ).toBe(true);
  expect(
    assets.takers
      .every(
        assetData => (
          assetData === takerAssetData
        ),
      ),
  ).toBe(true);
});

/* Full sort rules descibed here:
 * http://sra-api.s3-website-us-east-1.amazonaws.com/#operation/getOrders
*/
test('getOrdes: test sort', () => {
  const api = coreMocks.mocksOrdersFactory({
    assetDataA: makerAssetData,
    assetDataB: takerAssetData,
    orders: [
      {
        /* order to sell 10 ZRX for 15 WETH */
        type: 'ask',
        makerAssetAmount: '10',
        takerAssetAmount: '15',
        /* Test fields, price - price to taker for a one makerAsset  */
        /* price field only for exlanation sort logic */
        price: 1.5,
        sortTestMark: 2,
      },
      {
        type: 'ask',
        makerAssetAmount: '10',
        takerAssetAmount: '20',
        price: 2,
        sortTestMark: 1,
      },
      {
        type: 'ask',
        makerAssetAmount: '10',
        takerAssetAmount: '25',
        price: 2.5,
        sortTestMark: 0,
      },
    ],
    qty: {
      bids: 0,
      asks: 3,
    },
  });
  const orders = api.getOrders({
    makerAssetData,
    takerAssetData,
  });

  expect(orders.records[0].order.sortTestMark).toBe(0);
  expect(orders.records[1].order.sortTestMark).toBe(1);
  expect(orders.records[2].order.sortTestMark).toBe(2);
});
