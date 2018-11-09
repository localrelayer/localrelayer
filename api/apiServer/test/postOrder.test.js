import chai from 'chai';
import {
  SchemaValidator,
  schemas,
} from '@0xproject/json-schemas';
import {
  generatePseudoRandomSalt,
} from '@0xproject/order-utils';

import {
  request,
  randomEthereumAddress,
  generateRandomMakerAssetAmount,
  generateRandomTakerAssetAmount,
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
    const testData = {
      makerFee: '0',
      takerFee: '0',
      makerAssetAmount: generateRandomMakerAssetAmount(),
      takerAssetAmount: generateRandomTakerAssetAmount(),
      makerAssetData: '0xf47261b0000000000000000000000000e41d2489571d322189246dafa5ebde1f4699f498', /* ZRX */
      takerAssetData: '0xf47261b0000000000000000000000000c02aaa39b223fe8d0a0e5c4f27ead9083c756cc2', /* WETH */
      salt: generatePseudoRandomSalt().toString(),
      expirationTimeSeconds: '1532560590',
      signature: randomEthereumAddress(),
    };

    const requireError = field => ({
      field,
      code: 1000,
      reason: `requires property "${field}"`,
    });

    it('should response 400 with required fields errors', async () => {
      /* Missed one required field per each request */
      const allResponses = await Promise.all(requiredFields.map(f => (
        request
          .post('/v2/order')
          .send(
            requiredFields
              .filter(field => field !== f)
              .reduce((acc, fieldName) => ({
                ...acc,
                [fieldName]: (
                  fieldName.includes('Address')
                    ? randomEthereumAddress()
                    : testData[fieldName]
                ),
              }), {}),
          )
      )));
      allResponses.forEach((r, i) => {
        const field = requiredFields[i];
        expect(validator.isValid(
          r.body,
          schemas.relayerApiErrorResponseSchema,
        )).to.equal(true);
        expect(r.statusCode).to.equal(400);
        expect(r.body.reason).to.equal('Validation failed');
        expect(r.body.validationErrors).to.have.deep.members([requireError(field)]);
      });

      /* Empty request */
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
        requiredFields.map(field => requireError(field)),
      );
    });
  });
});
