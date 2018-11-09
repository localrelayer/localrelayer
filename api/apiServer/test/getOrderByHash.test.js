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

describe('OrderByHash', () => {
  let hash;

  before(async () => {
    await request
      .post('/v2/order')
      .send(createOrder({}));
    const orders = await Order.find({});
    hash = orders[0].orderHash;
  });

  after(async () => {
    await Order.deleteOne({ orderHash: hash });
  });

  it('should return valid order', async () => {
    const response = await request
      .get(`/v2/order/${hash}`);

    expect(
      validator.isValid(
        response.body.order,
        schemas.signedOrderSchema,
      ),
    ).to.equal(true);
  });
});
