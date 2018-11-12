import chai from 'chai';
import {
  SchemaValidator,
  schemas,
} from '@0x/json-schemas';
import {
  BigNumber,
} from '0x.js';
import {
  request,
} from './utils';

const validator = new SchemaValidator();
const { expect } = chai;

describe('OrderConfig', () => {
  const orderPayload = {
    exchangeAddress: '0x48bacb9266a570d521063ef5dd96e61686dbe788',
    makerAddress: '0x6ecbe1db9ef729cbe972c83fb886247691fb6beb',
    takerAddress: '0x0000000000000000000000000000000000000000',
    expirationTimeSeconds: new BigNumber(Date.now() + 1000000).div(900).ceil(),
    makerAssetAmount: '5000000000000000000',
    takerAssetAmount: '100000000000000000',
    makerAssetData: '0xf47261b00000000000000000000000000b1ba0af832d7c05fd64161e0db78e85978e8082',
    takerAssetData: '0xf47261b0000000000000000000000000871dd7c2b4b25e1aa18728e9d5f2af4c4e431f5c',
  };

  it('should return valid response', async () => {
    const response = await request
      .post('/v2/order_config')
      .send(orderPayload);

    expect(
      validator.isValid(
        response.body,
        schemas.relayerApiOrderConfigResponseSchema,
      ),
    ).to.equal(true);
  });

  it('should return error object and error status code', async () => {
    // let's make orderPayload invalid
    orderPayload.exchangeAddress = 'some incorrect value';
    const response = await request
      .post('/v2/order_config')
      .send(orderPayload);

    expect(
      response.statusCode === 400,
    ).to.equal(true);
    expect(
      validator.isValid(
        response.body,
        schemas.relayerApiErrorResponseSchema,
      ),
    ).to.equal(true);
  });
});
