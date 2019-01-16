import {
  orderHashUtils,
  signatureUtils,
  assetDataUtils,
  ContractWrappers,
  BigNumber,
} from '0x.js';
import {
  schemas,
} from '@0x/json-schemas';

import {
  logger,
} from 'apiLogger';
import {
  Order,
} from 'db';
import {
  initWeb3ProviderEngine,
  getContractAddressesForNetwork,
  transformBigNumberOrder,
  constructOrderRecord,
  validator,
  validateOrderConfig,
  validateExpirationTimeSeconds,
  validateNetworkId,
  getValidationErrors,
  validateOrderAmount,
} from 'utils';
import {
  redisClient,
} from 'redisClient';


export function createPostOrderEndpoint(standardRelayerApi) {
  /* create a middleware which will provide a provider and stop it at the end of request */
  standardRelayerApi.post('/order', async (ctx) => {
    const networkId = Number(ctx.query.networkId || '1');
    const web3ProviderEngine = initWeb3ProviderEngine(networkId);

    async function endPoint() {
      /* if orderConfig is provide for testing reasons
        don't validate it by field comparing
      */
      const { isCustomConfig } = ctx.query;
      const submittedOrder = ctx.request.body;
      /* type of isCustomConfig is string but it's OK we check for existence */
      const orderConfigErrors = isCustomConfig ? [] : validateOrderConfig(submittedOrder);
      if (
        validator.isValid(submittedOrder, schemas.signedOrderSchema)
        && validateExpirationTimeSeconds(submittedOrder.expirationTimeSeconds)
        && validateNetworkId(networkId)
        && !orderConfigErrors.length
      ) {
        const orderHash = orderHashUtils.getOrderHashHex(submittedOrder);
        const contractWrappers = new ContractWrappers(
          web3ProviderEngine,
          {
            networkId,
            contractAddresses: getContractAddressesForNetwork(networkId),
          },
        );

        try {
          await signatureUtils.isValidSignatureAsync(
            web3ProviderEngine,
            orderHash,
            submittedOrder.signature,
            submittedOrder.makerAddress,
          );
        } catch (err) {
          logger.debug('Signature is not a valid');
          logger.debug(err);
          ctx.status = 400;
          ctx.message = 'Validation error';
          ctx.body = {
            code: 100,
            reason: 'Validation failed',
            validationErrors: [{
              field: 'signature',
              code: 1005,
              reason: 'Invalid signature',
            }],
          };
          return;
        }
        try {
          await contractWrappers.exchange.validateOrderFillableOrThrowAsync(
            transformBigNumberOrder(submittedOrder),
          );
        } catch (err) {
          logger.debug('Order is not a valid');
          logger.debug(err);
          ctx.status = 400;
          ctx.message = 'Validation error';
          ctx.body = {
            code: 100,
            reason: 'Unfillable order',
          };
          return;
        }

        const {
          isMinAmountValid,
          isMaxAmountValid,
        } = await validateOrderAmount(submittedOrder);

        if (!isMinAmountValid || !isMaxAmountValid) {
          logger.debug('Order size is not a valid');
          ctx.status = 400;
          ctx.message = 'Validation error';
          ctx.body = {
            code: 100,
            reason: 'Validation Failed',
            validationErrors: [{
              field: 'amount',
              code: 1004,
              reason: 'Value out of range',
            }],
          };
          return;
        }
        const decMakerAssetData = (
          assetDataUtils.decodeERC20AssetData(submittedOrder.makerAssetData)
        );
        const decTakerAssetData = (
          assetDataUtils.decodeERC20AssetData(submittedOrder.takerAssetData)
        );
        const order = {
          ...submittedOrder,
          makerAssetAddress: decMakerAssetData.tokenAddress,
          makerAssetProxyId: decMakerAssetData.assetProxyId,
          takerAssetAddress: decTakerAssetData.tokenAddress,
          takerAssetProxyId: decTakerAssetData.assetProxyId,
          isValid: true,
          isShadowed: false,
          remainingFillableMakerAssetAmount: submittedOrder.makerAssetAmount,
          remainingFillableTakerAssetAmount: submittedOrder.takerAssetAmount,
          filledTakerAssetAmount: 0,
          createdAt: new Date().toISOString(),
          orderHash,
          networkId,
          sourceRelayer: 'instex',
        };
        const userSubmittedOrders = await Order.find({
          makerAddress: order.makerAddress,
          makerAssetAddress: order.makerAssetAddress,
          networkId,
          isValid: true,
          isShadowed: false,
        });
        const totalOrdersAmount = userSubmittedOrders.concat(order).reduce(
          (acc, cur) => acc.add(cur.makerAssetAmount), new BigNumber(0),
        );
        const makerAssetBalance = await contractWrappers.erc20Token.getBalanceAsync(
          order.makerAssetAddress,
          order.makerAddress,
        );
        if (new BigNumber(totalOrdersAmount).gt(makerAssetBalance)) {
          logger.debug('INSUFFICIENT BALANCE');
          logger.debug(`balance diff ${new BigNumber(makerAssetBalance).minus(totalOrdersAmount).toString()}`);
          ctx.status = 400;
          ctx.message = 'Insufficient balance to create order';
          return;
        }
        const orderInstance = new Order({
        /* the object will be muted here */
          ...order,
        });
        try {
          await orderInstance.save();
        } catch (e) {
          logger.debug('CANT SAVE', e);
          ctx.status = 400;
          return;
        }

        redisClient.publish('orderWatcher', JSON.stringify(constructOrderRecord(order)));
        ctx.status = 201;
        ctx.message = 'OK';
        ctx.body = {};
      } else {
        ctx.status = 400;
        ctx.message = 'Validation error';
        ctx.body = getValidationErrors(submittedOrder, schemas.signedOrderSchema);

        if (
          !ctx.body.validationErrors.find(e => e.field === 'expirationTimeSeconds')
          && !validateExpirationTimeSeconds(submittedOrder.expirationTimeSeconds)
        ) {
          ctx.body.validationErrors.push({
            code: 1004,
            field: 'expirationTimeSeconds',
            reason: 'Minimum possible expiration 60 sec',
          });
        }

        if (!validateNetworkId(networkId)) {
          ctx.body.validationErrors.push({
            code: 1006,
            field: 'networkId',
            reason: `Network id ${networkId} is not supported`,
          });
        }

        if (orderConfigErrors.length) {
          ctx.body.validationErrors = [
            ...ctx.body.validationErrors,
            ...orderConfigErrors.filter(
              e => (
                !ctx.body.validationErrors.find(ve => ve.field === e.field)
              ),
            ),
          ];
        }
      }
    }

    await endPoint();
    if (web3ProviderEngine) {
      web3ProviderEngine.stop();
    }
  });
}
