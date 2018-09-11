import {
  coreMocks,
} from 'instex-core';
import {
  SchemaValidator,
  schemas,
} from '@0xproject/json-schemas';

const { orderSchema } = schemas;
const validator = new SchemaValidator();

test('getOrders: validation of json schema', () => {
  const orderFromGetOrders = coreMocks.mocksOrdersFactory({}).getOrders({
    page: 1,
    perPage: 10,
  }).records[0].order;
  const validationResultForOrders = validator.isValid(orderFromGetOrders, orderSchema);
  expect(validationResultForOrders).toBe(true);
});

test('getOrders: type of returning parameters', () => {
  expect(coreMocks.mocksOrdersFactory({}).getOrders({
    page: 3,
    perPage: 10,
  })).toEqual({
    total: expect.any(Number),
    page: expect.any(Number),
    perPage: expect.any(Number),
    records: expect.any(Array),
  });
});
