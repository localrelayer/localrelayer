import Koa from 'koa';
import Router from 'koa-router';
import {
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
  AssetPair,
} from 'db';
import {
  getOrderConfig,
  validator,
  getValidationErrors,
} from 'utils';

import {
  createPostOrderEndpoint,
} from './postOrder';
import {
  createOrderBookEndpoint,
} from './orderBook';
import {
  FEE_RECIPIENT,
} from '../../scenarios/utils/constants';

const app = new Koa();
const standardRelayerApi = new Router({
  prefix: '/v2',
});
createPostOrderEndpoint(standardRelayerApi);
createOrderBookEndpoint(standardRelayerApi);

export const metaFields = [
  'networkId',
  'completedAt',
];

export const fieldsToSkip = [
  '_id',
  'orderHash',
  'makerAssetAddress',
  'takerAssetAddress',
  'makerAssetProxyId',
  'takerAssetProxyId',
  ...metaFields,
];


standardRelayerApi.get('/order/:orderHash', async (ctx) => {
  logger.debug('HTTP: GET ORDER BY HASH');
  const { networkId = 1 } = ctx.query;
  const order = await Order.findOne({
    orderHash: ctx.params.orderHash,
    networkId,
  })
    .select(`-${fieldsToSkip.join(' -')}`)
    .lean();
  const {
    isValid,
    remainingFillableMakerAssetAmount,
    remainingFillableTakerAssetAmount,
    ...orderMetaOmitted
  } = order;
  const response = {
    order: orderMetaOmitted,
    metaData: {
      isValid: order.isValid,
      remainingFillableMakerAssetAmount: order.remainingFillableMakerAssetAmount,
      remainingFillableTakerAssetAmount: order.remainingFillableTakerAssetAmount,
    },
  };
  ctx.status = 200;
  ctx.message = 'The order and meta info associated with the orderHash';
  ctx.body = response;
});

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
      FEE_RECIPIENT,
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
  }, {
    'assetDataA._id': 0,
    'assetDataB._id': 0,
  })
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
    .limit(parseInt(perPage, 10))
    .lean();
  if (!takerAssetData.$exists && !makerAssetData.$exists) {
    orders.sort(sort);
  }
  const records = orders.map((record) => {
    const {
      isValid,
      remainingFillableMakerAssetAmount,
      remainingFillableTakerAssetAmount,
      ...orderMetaOmitted
    } = record;
    return {
      order: orderMetaOmitted,
      metaData: {
        isValid: record.isValid,
        remainingFillableMakerAssetAmount: record.remainingFillableMakerAssetAmount,
        remainingFillableTakerAssetAmount: record.remainingFillableTakerAssetAmount,
      },
    };
  });
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
