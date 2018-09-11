import {
  SchemaValidator,
  schemas,
} from '@0xproject/json-schemas';

import {
  coreMocks,
} from 'instex-core';

const validator = new SchemaValidator();

test('getOrderBook: validate getOrderBook response schema', () => {
  const mock = coreMocks.mocksOrdersFactory();
  const result = validator.validate(
    mock.getOrderBook(),
    schemas.relayerApiOrderbookResponseSchema,
  );
  const { errors } = result;
  if (errors.length) {
    console.log(result);
  }
  expect(errors.length).toBe(0);
});

test('getOrderBook: check the amount of bids and asks records', () => {
  const orderBook = coreMocks.mocksOrdersFactory({
    qty: {
      bids: 20,
      asks: 30,
    },
  }).getOrderBook({});
  expect(orderBook.asks.records.length).toBe(30);
  expect(orderBook.asks.records.length).toBe(30);
});

test('mockOrdersFactory: bidsDescendingOrder', () => {
  const isDescending = a => a
    .slice(1)
    .map((e, i) => e <= a[i])
    .every(x => x);
  const bidsRecord = coreMocks.mocksOrdersFactory({}).getOrderBook({}).bids.records;
  const takerFeeArray = bidsRecord.map(
    r => r.order.takerFee,
  );
  expect(isDescending(takerFeeArray)).toBe(true);
});

test('mockOrdersFactory: asksAscendingOrder', () => {
  const isAscending = a => a
    .slice(1)
    .map((e, i) => e >= a[i])
    .every(x => x);
  const bidsRecord = coreMocks.mocksOrdersFactory({}).getOrderBook({}).bids.records;
  const takerFeeArray = bidsRecord.map(
    r => r.order.takerFee,
  );
  expect(isAscending(takerFeeArray)).toBe(true);
});

// TODO: tests for filter
// TODO: tests for pagination
