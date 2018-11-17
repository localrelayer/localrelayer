import Koa from 'koa';
import Router from 'koa-router';
import {
  orderHashUtils,
  signatureUtils,
  assetDataUtils,
  ContractWrappers,
  BigNumber,
} from '0x.js';
import {
  getContractAddressesForNetworkOrThrow,
} from '@0x/contract-addresses';
import {
  SchemaValidator,
  schemas,
} from '@0x/json-schemas';
import {
  NULL_ADDRESS,
} from '../../scenarios/utils/constants';
import {
  initWeb3ProviderEngine,
  getOrderConfig,
  GANACHE_CONTRACT_ADDRESSES,
} from '../../utils';
import {
  Order,
  AssetPair,
} from '../../db';
import {
  logger,
} from '../apiLogger';
import {
  redisClient,
} from '../../redis';

const app = new Koa();
const standardRelayerApi = new Router({
  prefix: '/v2',
});
const validator = new SchemaValidator();
export const fieldsToSkip = [
  '_id',
  'orderHash',
  'networkId',
  'makerAssetAddress',
  'takerAssetAddress',
  'makerAssetProxyId',
  'takerAssetProxyId',
];

const getValidationErrors = (instance, schema) => {
  const validationInfo = validator.validate(
    instance,
    schema,
  );
  const errors = validationInfo.errors.filter(e => e.name !== 'allOf').map(
    error => (
      {
        field: error.name === 'required' ? error.argument : error.property.split('.')[1],
        code: error.name === 'required' ? 1000 : 1001,
        reason: error.message,
      }
    ),
  );
  return {
    code: 100,
    reason: 'Validation failed',
    validationErrors: errors,
  };
};

const tranformBigNumberOrder = order => (
  Object.keys(order).reduce((acc, fieldName) => ({
    ...acc,
    [fieldName]: (
      [
        'salt',
        'makerAssetAmount',
        'takerAssetAmount',
        'makerFee',
        'takerFee',
        'expirationTimeSeconds',
      ].includes(fieldName) ? new BigNumber(order[fieldName]) : order[fieldName]
    ),
  }), {})
);

const validateExpirationTimeSeconds = expirationTimeSeconds => (
  (+new Date() - Number(expirationTimeSeconds)) > 60
);

const validateNetworkId = networkId => ([
  1,
  42,
  ...(process.env.NODE_ENV === 'test' ? [50] : []),
].includes(networkId));

const validateOrderConfig = (order) => {
  const config = getOrderConfig();
  return Object.keys(config).reduce(
    (acc, fieldName) => ([
      ...acc,
      ...(
        order[fieldName] !== config[fieldName]
          ? [{
            field: fieldName,
            code: fieldName.includes('Address') ? 1003 : 1004,
            reason: 'Wrong order config field',
          }]
          : []
      ),
    ]), [],
  );
};

export const sortOrderbook = (a, b) => {
  const aPrice = new BigNumber(a.takerAssetAmount).div(a.makerAssetAmount);
  const aTakerFeePrice = new BigNumber(a.takerFee).div(a.takerAssetAmount);
  const bPrice = new BigNumber(b.takerAssetAmount).div(b.makerAssetAmount);
  const bTakerFeePrice = new BigNumber(b.takerFee).div(b.takerAssetAmount);
  const aExpirationTimeSeconds = parseInt(a.expirationTimeSeconds, 10);
  const bExpirationTimeSeconds = parseInt(b.expirationTimeSeconds, 10);
  return aPrice - bPrice
    || aTakerFeePrice - bTakerFeePrice
    || aExpirationTimeSeconds - bExpirationTimeSeconds;
};

standardRelayerApi.post('/order_config', (ctx) => {
  logger.debug('HTTP: POST order config');
  const orderConfigRequest = ctx.request.body;
  if (!validator.isValid(orderConfigRequest, schemas.relayerApiOrderConfigPayloadSchema)) {
    ctx.status = 400;
    ctx.message = 'Validation error';
    ctx.body = getValidationErrors(
      orderConfigRequest,
      schemas.relayerApiOrderConfigPayloadSchema,
    );
  } else {
    ctx.status = 200;
    ctx.message = 'The additional fields necessary in order to submit an order to the relayer.';
    ctx.body = getOrderConfig();
  }
});

/* create a middleware wich will provide a provider and stop it at the end of request */
standardRelayerApi.post('/order', async (ctx) => {
  const networkId = Number(ctx.query.networkId || '1');
  const web3ProviderEngine = initWeb3ProviderEngine(networkId);

  async function endPoint() {
    const submittedOrder = ctx.request.body;
    const orderConfigErrors = validateOrderConfig(submittedOrder);

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
          contractAddresses: (
            networkId === 50
              ? GANACHE_CONTRACT_ADDRESSES
              : getContractAddressesForNetworkOrThrow(networkId)
          ),
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
          tranformBigNumberOrder(submittedOrder),
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

      const decMakerAssetData = assetDataUtils.decodeERC20AssetData(submittedOrder.makerAssetData);
      const decTakerAssetData = assetDataUtils.decodeERC20AssetData(submittedOrder.takerAssetData);
      const order = new Order({
        ...submittedOrder,
        makerAssetAddress: decMakerAssetData.tokenAddress,
        makerAssetProxyId: decMakerAssetData.assetProxyId,
        takerAssetAddress: decTakerAssetData.tokenAddress,
        takerAssetProxyId: decTakerAssetData.assetProxyId,
        orderHash,
        networkId,
      });
      try {
        await order.save();
      } catch (e) {
        logger.debug('CANT SAVE', e);
        ctx.status = 400;
        return;
      }

      redisClient.publish('orders', JSON.stringify(order));
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

standardRelayerApi.get('/orderbook', async (ctx) => {
  logger.debug('HTTP: GET orderbook');
  const {
    baseAssetData,
    quoteAssetData,
    page = 1,
    perPage = 100,
    networkId = 1,
  } = ctx.query;

  const bidOrders = await Order.find({
    takerAssetData: baseAssetData,
    makerAssetData: quoteAssetData,
    networkId,
  })
    .select(`-${fieldsToSkip.join(' -')}`)
    .skip(perPage * (page - 1))
    .limit(parseInt(perPage, 10));
  const askOrders = await Order.find({
    takerAssetData: quoteAssetData,
    makerAssetData: baseAssetData,
    networkId,
  })
    .select(`-${fieldsToSkip.join(' -')}`)
    .skip(perPage * (page - 1))
    .limit(parseInt(perPage, 10));
  const askOrdersSorted = askOrders.sort(sortOrderbook);
  const bidOrdersSorted = bidOrders.sort(sortOrderbook);
  const bidApiOrders = bidOrdersSorted.map(order => ({ metaData: {}, order }));
  const askApiOrders = askOrdersSorted.map(order => ({ metaData: {}, order }));
  const response = {
    bids: {
      records: bidApiOrders,
      page: parseInt(page, 10),
      perPage: parseInt(perPage, 10),
      total: bidOrders.length,
    },
    asks: {
      records: askApiOrders,
      page: parseInt(page, 10),
      perPage: parseInt(perPage, 10),
      total: askOrders.length,
    },
  };
  ctx.status = 200;
  ctx.message = 'The sorted order book for the specified asset pair.';
  ctx.body = response;
});

standardRelayerApi.get('/order/:orderHash', async (ctx) => {
  logger.debug('HTTP: GET ORDER BY HASH');
  const { networkId = 1 } = ctx.query;
  const order = await Order.findOne({
    orderHash: ctx.params.orderHash,
    networkId,
  })
    .select(`-${fieldsToSkip.join(' -')}`);
  const response = {
    order,
    metaData: {},
  };
  ctx.status = 200;
  ctx.message = 'The order and meta info associated with the orderHash';
  ctx.body = response;
});

// TODO: decide what to do with this endpoint
standardRelayerApi.get('/fee_recipients', async (ctx) => {
  const {
    networkId = 1,
    page = 1,
    perPage = 100,
  } = ctx.query;
  ctx.status = 200;
  ctx.message = 'A collection of all used fee recipient addresses.';
  ctx.body = {
    total: 1,
    page,
    perPage,
    records: [
      NULL_ADDRESS,
    ],
  };
});

standardRelayerApi.get('/asset_pairs', async (ctx) => {
  logger.debug('HTTP: GET ASSET PAIRS');
  const {
    assetDataA = { $exists: true },
    assetDataB = { $exists: true },
    networkId = 1,
    page = 1,
    perPage = 100,
  } = ctx.query;
  const assetPairs = await AssetPair.find({
    'assetDataA.assetData': assetDataA,
    'assetDataB.assetData': assetDataB,
    networkId,
  }, { 'assetDataA._id': 0, 'assetDataB._id': 0 })
    .select('-_id -networkId')
    .skip(perPage * (page - 1))
    .limit(parseInt(perPage, 10));
  const response = {
    total: assetPairs.length,
    page: parseInt(page, 10),
    perPage,
    records: assetPairs,
  };
  ctx.status = 200;
  ctx.message = 'Returns a collection of available asset pairs with some meta info';
  ctx.body = response;
});

standardRelayerApi.get('/orders', async (ctx) => {
  logger.debug('HTTP: GET ORDERS');
  const sort = (a, b) => {
    const aPrice = new BigNumber(a.takerAssetAmount).div(a.makerAssetAmount);
    const bPrice = new BigNumber(b.takerAssetAmount).div(b.makerAssetAmount);
    return aPrice - bPrice;
  };
  const {
    makerAssetProxyId = { $exists: true },
    takerAssetProxyId = { $exists: true },
    makerAssetAddress = { $exists: true },
    takerAssetAddress = { $exists: true },
    exchangeAddress = { $exists: true },
    senderAddress = { $exists: true },
    makerAssetData = { $exists: true },
    takerAssetData = { $exists: true },
    traderAssetData = { $exists: true },
    makerAddress = { $exists: true },
    takerAddress = { $exists: true },
    traderAddress = { $exists: true },
    feeRecipientAddress = { $exists: true },
    networkId = 1,
    page = 1,
    perPage = 100,
  } = ctx.query;
  const orders = await Order.find({
    makerAssetProxyId,
    takerAssetProxyId,
    makerAssetAddress,
    takerAssetAddress,
    makerAssetData,
    takerAssetData,
    exchangeAddress,
    senderAddress,
    makerAddress,
    takerAddress,
    feeRecipientAddress,
    networkId,
    $and: [
      { $or: [{ makerAddress: traderAddress }, { takerAddress: traderAddress }] },
      { $or: [{ makerAssetData: traderAssetData }, { takerAssetData: traderAssetData }] },
    ],
  })
    .select(`-${fieldsToSkip.join(' -')}`)
    .skip(perPage * (page - 1))
    .limit(parseInt(perPage, 10));
  if (!takerAssetData.$exists && !makerAssetData.$exists) {
    orders.sort(sort);
  }
  const records = orders.map(record => ({
    order: record,
    metaData: {},
  }));
  const response = {
    total: orders.length,
    page: parseInt(page, 10),
    perPage,
    records,
  };
  ctx.status = 200;
  ctx.message = 'A collection of 0x orders with meta-data as specified by query params';
  ctx.body = response;
});

app.use(standardRelayerApi.routes());

export default app;
