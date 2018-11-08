import chai from 'chai';
import {
  SchemaValidator,
  schemas,
} from '@0xproject/json-schemas';

import {
  request,
} from './utils';


const validator = new SchemaValidator();
const { expect } = chai;


describe('postOrder', () => {
  describe('create a new order with wrond data', () => {
    const requiredFields = [
      'makerAddress',
      'takerAddress',
      'makerFee',
      'takerFee',
      'senderAddress',
      'makerAssetAmount',
      'takerAssetAmount',
      'makerAssetData',
      'takerAssetData',
      'salt',
      'exchangeAddress',
      'feeRecipientAddress',
      'expirationTimeSeconds',
      'signature',
    ];
    it('should response 400 with required fields errors', async () => {
      const response = await request
        .post('/v2/order')
        .send({});
      expect(validator.isValid(
        response.body,
        schemas.relayerApiErrorResponseSchema,
      )).to.equal(true);
      expect(response.statusCode).to.equal(400);
      expect(response.body.reason).to.equal('Validation failed');
      expect(response.body.validationErrors).to.have.deep.members(
        requiredFields.map(field => ({
          field,
          code: 1000,
          reason: `requires property "${field}"`,
        })),
      );
    });
  });
});
