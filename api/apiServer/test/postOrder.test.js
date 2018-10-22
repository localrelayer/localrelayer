import chai from 'chai';
import {
  SchemaValidator,
  schemas,
} from '@0xproject/json-schemas';
import {
  Order,
} from '../../db';
import {
  request,
  createOrder,
} from './utils';

const validator = new SchemaValidator();
const { expect } = chai;

describe('postOrder', () => {
  after(async () => {
    await Order.deleteOne({});
  });

  it('should check if created order has valid schema', async () => {
    const order = createOrder({});

    expect(validator.isValid(
      order,
      schemas.signedOrderSchema,
    )).to.equal(true);
  });

  it('should create order and insert it to db', async () => {
    const order = createOrder({});
    const response = await request
      .post('/v2/order')
      .send(order);

    expect(response.statusCode).to.equal(201);
    expect(response.res.statusMessage).to.equal('OK');
  });
});
