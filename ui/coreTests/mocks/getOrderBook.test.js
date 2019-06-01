import {
  SchemaValidator,
  schemas,
} from '@0x/json-schemas';

import {
  coreMocks,
} from 'localrelayer-core';


const baseAssetData = '0xf47261b0000000000000000000000000e41d2489571d322189246dafa5ebde1f4699f498'; /* ZRX */
const quoteAssetData = '0xf47261b0000000000000000000000000c02aaa39b223fe8d0a0e5c4f27ead9083c756cc2'; /* WETH */

test('getOrderBook: throw error without required fields', () => {
  const api = coreMocks.mocksOrdersFactory();
  const err = 'baseAssetData and quoteAssetData are required';
  expect(() => {
    api.getOrderBook();
  }).toThrow(err);
  expect(() => {
    api.getOrderBook({});
  }).toThrow(err);
  expect(() => {
    api.getOrderBook({
      baseAssetData,
    });
  }).toThrow(err);
  expect(() => {
    api.getOrderBook({
      quoteAssetData,
    });
  }).toThrow(err);
});

test('getOrderBook: validate getOrderBook response schema', () => {
  const validator = new SchemaValidator();
  const api = coreMocks.mocksOrdersFactory({
    assetDataA: baseAssetData,
    assetDataB: quoteAssetData,
  });
  const result = validator.validate(
    api.getOrderBook({
      baseAssetData,
      quoteAssetData,
    }),
    schemas.relayerApiOrderbookResponseSchema,
  );
  const { errors } = result;
  if (errors.length) {
    console.log(result);
  }

  expect(errors.length).toBe(0);
});

test('getOrderBook: filter baseAssetData and quoteAssetData required fields', () => {
  const orders = coreMocks.mocksOrdersFactory({
    assetDataA: baseAssetData,
    assetDataB: quoteAssetData,
  }).getOrderBook({
    baseAssetData,
    quoteAssetData,
  });

  const assets = {
    makerBids: orders.bids.records.map(r => r.order.makerAssetData),
    makerAsks: orders.asks.records.map(r => r.order.makerAssetData),
    takerBids: orders.bids.records.map(r => r.order.takerAssetData),
    takerAsks: orders.asks.records.map(r => r.order.takerAssetData),
  };

  expect(
    assets.makerBids
      .every(
        assetData => (
          assetData === quoteAssetData
        ),
      ),
  ).toBe(true);
  expect(
    assets.makerAsks
      .every(
        assetData => (
          assetData === baseAssetData
        ),
      ),
  ).toBe(true);
  expect(
    assets.takerBids
      .every(
        assetData => (
          assetData === baseAssetData
        ),
      ),
  ).toBe(true);
  expect(
    assets.takerAsks
      .every(
        assetData => (
          assetData === quoteAssetData
        ),
      ),
  ).toBe(true);
});

test('getOrderBook: test pagination', () => {
  const api = coreMocks.mocksOrdersFactory({
    assetDataA: baseAssetData,
    assetDataB: quoteAssetData,
    qty: {
      bids: 2,
      asks: 2,
    },
  });
  const allOrders = api.getOrderBook({
    baseAssetData,
    quoteAssetData,
    page: 1,
    perPage: 2,
  });
  const page = 2;
  const perPage = 1;
  const paginatedOrders = api.getOrderBook({
    baseAssetData,
    quoteAssetData,
    page,
    perPage,
  });
  const offsetToCheckLastPage = (page - 1) * perPage;
  const testBidRecordFromPage = paginatedOrders.bids.records[0];
  const testAskRecordFromPage = paginatedOrders.asks.records[0];
  const testBidRecordFromAll = allOrders.bids.records[offsetToCheckLastPage];
  const testAskRecordFromAll = allOrders.asks.records[offsetToCheckLastPage];

  expect(testBidRecordFromPage).toMatchObject(testBidRecordFromAll);
  expect(testAskRecordFromPage).toMatchObject(testAskRecordFromAll);

  expect(paginatedOrders.bids.records.length).toBe(perPage);
  expect(paginatedOrders.asks.records.length).toBe(perPage);
});

/* Full sort rules descibed here:
 * http://sra-api.s3-website-us-east-1.amazonaws.com/#operation/getOrderbook
*/
test('getOrderBook: test sort', () => {
  /* Bids should be ordered for those who want to sell(ask)
   * i.e the most suitable orders is where the most best price to sell - the most higher
   * makerAssetAmount/takerAssetAmount
  */
  const unsortedBids = [
    {
      /* order to buy 15 ZRX for 10 WETH */
      type: 'bid',
      makerAssetAmount: '10',
      takerAssetAmount: '15',
      takerFee: '1',
      expirationTimeSeconds: '10',
      /* Test fields, priceRate - price to taker for a one makerAsset  */
      /* price field only for exlanation sort logic */
      price: 0.66,
      sortTestMark: 0,
    },
    {
      /* order to buy 20 ZRX for 10 WETH */
      type: 'bid',
      makerAssetAmount: '10',
      takerAssetAmount: '20',
      takerFee: '2',
      expirationTimeSeconds: '10',
      price: 0.5,
      sortTestMark: 2,
    },
    {
      type: 'bid',
      makerAssetAmount: '10',
      takerAssetAmount: '20',
      takerFee: '2',
      expirationTimeSeconds: '5',
      priceRate: 0.5,
      sortTestMark: 3,
    },
    {
      type: 'bid',
      makerAssetAmount: '10',
      takerAssetAmount: '20',
      takerFee: '1',
      expirationTimeSeconds: '10',
      price: 0.5,
      sortTestMark: 1,
    },
  ];
  /* Asks should be ordered for those who want to buy(bid)
   * i.e the most suitable orders is where the most best price to buy - the most cheap
   * takerAssetAmount/makerAssetAmount
  */
  const unsortedAsks = [
    {
      /* order to sell 10 ZRX for 15 WETH */
      type: 'ask',
      makerAssetAmount: '10',
      takerAssetAmount: '15',
      takerFee: '1',
      expirationTimeSeconds: '10',
      /* Test fields, price - price to taker for a one makerAsset  */
      /* price field only for exlanation sort logic */
      price: 1.5,
      sortTestMark: 0,
    },
    {
      /* order to sell 10 ZRX for 20 WETH */
      type: 'ask',
      makerAssetAmount: '10',
      takerAssetAmount: '20',
      takerFee: '2',
      expirationTimeSeconds: '10',
      price: 2,
      sortTestMark: 2,
    },
    {
      type: 'ask',
      makerAssetAmount: '10',
      takerAssetAmount: '20',
      takerFee: '2',
      expirationTimeSeconds: '5',
      price: 2,
      sortTestMark: 3,
    },
    {
      type: 'ask',
      makerAssetAmount: '10',
      takerAssetAmount: '20',
      takerFee: '1',
      expirationTimeSeconds: '10',
      price: 2,
      sortTestMark: 1,
    },
  ];
  const api = coreMocks.mocksOrdersFactory({
    assetDataA: baseAssetData,
    assetDataB: quoteAssetData,
    orders: [
      ...unsortedBids,
      ...unsortedAsks,
    ],
    qty: {
      bids: 4,
      asks: 4,
    },
  });
  const orders = api.getOrderBook({
    baseAssetData,
    quoteAssetData,
  });

  expect(orders.bids.records[0].order.sortTestMark).toBe(0);
  expect(orders.bids.records[1].order.sortTestMark).toBe(1);
  expect(orders.bids.records[2].order.sortTestMark).toBe(2);
  expect(orders.bids.records[3].order.sortTestMark).toBe(3);

  expect(orders.asks.records[0].order.sortTestMark).toBe(0);
  expect(orders.asks.records[1].order.sortTestMark).toBe(1);
  expect(orders.asks.records[2].order.sortTestMark).toBe(2);
  expect(orders.asks.records[3].order.sortTestMark).toBe(3);
});
