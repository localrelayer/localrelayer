import chai from 'chai';
import {
  orderHashUtils,
  signatureUtils,
  ContractWrappers,
  BigNumber,
} from '0x.js';
import {
  SchemaValidator,
  schemas,
} from '@0x/json-schemas';
import {
  generatePseudoRandomSalt,
} from '@0x/order-utils';
import {
  Web3Wrapper,
} from '@0x/web3-wrapper';
import {
  request,
  initTestProvider,
} from './utils';
import {
  GANACHE_CONTRACT_ADDRESSES,
  NULL_ADDRESS,
  getOrderConfig,
  randomEthereumAddress,
  generateRandomMakerAssetAmount,
  generateRandomTakerAssetAmount,
  getRandomFutureDateInSeconds,
} from '../../utils';


const validator = new SchemaValidator();
const { expect } = chai;

const orderConfig = getOrderConfig();
const testData = {
  makerAddress: () => randomEthereumAddress(),
  takerAddress: () => NULL_ADDRESS,
  makerAssetAmount: () => generateRandomMakerAssetAmount(18).toString(),
  takerAssetAmount: () => generateRandomTakerAssetAmount(18).toString(),
  makerAssetData: () => '0xf47261b0000000000000000000000000871dd7c2b4b25e1aa18728e9d5f2af4c4e431f5c', /* ZRX */
  takerAssetData: () => '0xf47261b00000000000000000000000000b1ba0af832d7c05fd64161e0db78e85978e8082', /* WETH */
  exchangeAddress: () => randomEthereumAddress(),
  salt: () => generatePseudoRandomSalt().toString(),
  expirationTimeSeconds: () => getRandomFutureDateInSeconds().toString(),
  signature: () => randomEthereumAddress(),
};
const requiredFields = Object.keys({
  ...orderConfig,
  ...testData,
});

describe('postOrder', () => {
  describe('create a new order with wrong data', () => {
    it('should response 400 with required fields errors', async () => {
      const requireError = field => ({
        field,
        code: 1000,
        reason: `requires property "${field}"`,
      });
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
                  orderConfig[fieldName]
                  || testData[fieldName]()
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

    it('should response 400 with wrong format fields errors', async () => {
      const formatError = (field) => {
        const pattern = JSON.stringify(
          field === 'signature'
            ? schemas.hexSchema.pattern
            : schemas[schemas.orderSchema.properties[field].$ref.substring(1)].pattern,
        );
        return ({
          field,
          code: 1001,
          reason: `does not match pattern ${pattern}`,
        });
      };
      /* Wrong one field per each request */
      const allResponses = await Promise.all(requiredFields.map(f => (
        request
          .post('/v2/order')
          .send(
            requiredFields
              .filter(field => field !== f)
              .reduce((acc, fieldName) => ({
                ...acc,
                [fieldName]: (
                  orderConfig[fieldName]
                  || testData[fieldName]()
                ),
              }), {
                [f]: 'wrong format',
              }),
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
        expect(r.body.validationErrors).to.have.deep.members([formatError(field)]);
      });

      /* request with all fields */
      const response = await request
        .post('/v2/order')
        .send(
          requiredFields
            .reduce((acc, fieldName) => ({
              ...acc,
              [fieldName]: 'wrong format',
            }), {}),
        );
      expect(validator.isValid(
        response.body,
        schemas.relayerApiErrorResponseSchema,
      )).to.equal(true);
      expect(response.statusCode).to.equal(400);
      expect(response.body.reason).to.equal('Validation failed');
      expect(response.body.validationErrors).to.have.deep.members(
        requiredFields.map(field => formatError(field)),
      );
    });

    it('should response 400 with wrong expirationTimeSeconds', async () => {
      const response = await request
        .post('/v2/order')
        .send(
          requiredFields
            .reduce((acc, fieldName) => ({
              [fieldName]: (
                orderConfig[fieldName]
                || testData[fieldName]()
              ),
              ...acc,
            }), {
              expirationTimeSeconds: (+new Date()).toString(),
            }),
        );
      expect(validator.isValid(
        response.body,
        schemas.relayerApiErrorResponseSchema,
      )).to.equal(true);
      expect(response.statusCode).to.equal(400);
      expect(response.body.reason).to.equal('Validation failed');
      expect(response.body.validationErrors).to.have.deep.members([{
        field: 'expirationTimeSeconds',
        code: 1004,
        reason: 'Minimum possible expiration 60 sec',
      }]);
    });

    it('should response 400 with unsupported networkId', async () => {
      /* Ropsten network id */
      const networkId = '3';
      const response = await request
        .post(`/v2/order?networkId=${networkId}`)
        .send(
          requiredFields
            .reduce((acc, fieldName) => ({
              ...acc,
              [fieldName]: (
                orderConfig[fieldName]
                || testData[fieldName]()
              ),
            }), {}),
        );
      expect(validator.isValid(
        response.body,
        schemas.relayerApiErrorResponseSchema,
      )).to.equal(true);
      expect(response.statusCode).to.equal(400);
      expect(response.body.reason).to.equal('Validation failed');
      expect(response.body.validationErrors).to.have.deep.members([{
        field: 'networkId',
        code: 1006,
        reason: `Network id ${networkId} is not supported`,
      }]);
    });

    it('should response 400 with invalid signature', async () => {
      const response = await request
        .post('/v2/order')
        .send(
          requiredFields
            .reduce((acc, fieldName) => ({
              ...acc,
              [fieldName]: (
                orderConfig[fieldName]
                || testData[fieldName]()
              ),
            }), {}),
        );
      expect(validator.isValid(
        response.body,
        schemas.relayerApiErrorResponseSchema,
      )).to.equal(true);
      expect(response.statusCode).to.equal(400);
      expect(response.body.reason).to.equal('Validation failed');
      expect(response.body.validationErrors).to.have.deep.members([{
        field: 'signature',
        code: 1005,
        reason: 'Invalid signature',
      }]);
    });

    it('should response 400 with low balance', async () => {
      /* Testnet network id */
      const networkId = 50;
      const provider = initTestProvider();
      const web3Wrapper = new Web3Wrapper(provider);
      const [makerAddress] = await web3Wrapper.getAvailableAddressesAsync();
      const contractAddresses = GANACHE_CONTRACT_ADDRESSES;
      const contractWrappers = new ContractWrappers(
        provider,
        {
          networkId,
          contractAddresses,
        },
      );
      /* maker balance in base units */
      const makerAssetAmount = await contractWrappers.erc20Token.getBalanceAsync(
        contractAddresses.zrxToken,
        makerAddress,
      );
      /* some value gt current balance which will be set as makerAssetAmount */
      const overMakerAssetAmount = new BigNumber(makerAssetAmount).plus(1);
      // Allowance
      await contractWrappers.erc20Token.setUnlimitedProxyAllowanceAsync(
        contractAddresses.zrxToken,
        makerAddress,
      );
      const order = (
        requiredFields
          .reduce((acc, fieldName) => ({
            [fieldName]: (
              orderConfig[fieldName]
              || testData[fieldName]()
            ),
            ...acc,
          }), {
            makerAddress,
            makerAssetAmount: overMakerAssetAmount,
          })
      );
      const orderHash = orderHashUtils.getOrderHashHex(order);
      const signature = await signatureUtils.ecSignHashAsync(
        provider,
        orderHash,
        makerAddress,
      );
      provider.stop();
      const response = await request
        .post(`/v2/order?networkId=${networkId}`)
        .send({
          ...order,
          signature,
        });
      expect(validator.isValid(
        response.body,
        schemas.relayerApiErrorResponseSchema,
      )).to.equal(true);
      expect(response.statusCode).to.equal(400);
      expect(response.body.reason).to.equal('Unfillable order');
    });

    it('should response 400 without allowance', async () => {
      const networkId = 50;
      const provider = initTestProvider();
      const web3Wrapper = new Web3Wrapper(provider);
      const [makerAddress] = await web3Wrapper.getAvailableAddressesAsync();
      const contractAddresses = GANACHE_CONTRACT_ADDRESSES;
      const contractWrappers = new ContractWrappers(
        provider,
        {
          networkId,
          contractAddresses,
        },
      );
      /* maker balance in base units */
      const makerAssetAmount = await contractWrappers.erc20Token.getBalanceAsync(
        contractAddresses.zrxToken,
        makerAddress,
      );
      /* amount lt makerAssetAmount, which will be set as allowance limit */
      const bellowMakerAssetAmount = makerAssetAmount.minus(1);
      // Allowance
      /* set allowance lt makerAssetAmount */
      await contractWrappers.erc20Token.setProxyAllowanceAsync(
        contractAddresses.zrxToken,
        makerAddress,
        /* amountInBaseUnits */
        bellowMakerAssetAmount,
      );
      const order = (
        requiredFields
          .reduce((acc, fieldName) => ({
            [fieldName]: (
              orderConfig[fieldName]
              || testData[fieldName]()
            ),
            ...acc,
          }), {
            makerAddress,
            makerAssetAmount,
          })
      );
      const orderHash = orderHashUtils.getOrderHashHex(order);
      const signature = await signatureUtils.ecSignHashAsync(
        provider,
        orderHash,
        makerAddress,
      );
      provider.stop();
      const response = await request
        .post(`/v2/order?networkId=${networkId}`)
        .send({
          ...order,
          signature,
        });
      expect(validator.isValid(
        response.body,
        schemas.relayerApiErrorResponseSchema,
      )).to.equal(true);
      expect(response.statusCode).to.equal(400);
      expect(response.body.reason).to.equal('Unfillable order');
    });

    it('should response 400 with validateOrderConfig', async () => {
      const response = await request
        .post('/v2/order?validateOrderConfig=true')
        .send(
          requiredFields
            .reduce((acc, fieldName) => ({
              [fieldName]: (
                orderConfig[fieldName]
                || testData[fieldName]()
              ),
              ...acc,
            }), {
              senderAddress: randomEthereumAddress(),
            }),
        );
      expect(validator.isValid(
        response.body,
        schemas.relayerApiErrorResponseSchema,
      )).to.equal(true);
      expect(response.statusCode).to.equal(400);
      expect(response.body.reason).to.equal('Validation failed');
      expect(response.body.validationErrors).to.have.deep.members([{
        field: 'senderAddress',
        code: 1003,
        reason: 'Wrong order config field',
      }]);
    });
  });

  describe('create a new order with correct data', () => {
    /* make sure order was created */
  });
});
