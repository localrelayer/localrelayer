import Koa from 'koa';
import Router from 'koa-router';
import {
  orderHashUtils,
  BigNumber,
} from '0x.js';
import {
  SchemaValidator,
  schemas,
} from '@0xproject/json-schemas';
import {
  ZERO,
  NULL_ADDRESS,
} from '../../scenarios/utils/constants';
import {
  Order,
  AssetPair,
} from '../../db';
// should be removed! Only for inserting testing data to db
// ************************************************
import * as mainAssetPairs from '../../../ui/core/src/mocks/assetPairs.main';
import * as kovanAssetPairs from '../../../ui/core/src/mocks/assetPairs.kovan';
import * as testAssetPairs from '../../../ui/core/src/mocks/assetPairs.test';
// ************************************************

const app = new Koa();
const standardRelayerApi = new Router({
  prefix: '/v2',
});
const validator = new SchemaValidator();

const getValidationErrors = (instance, schema) => {
  const validationInfo = validator.validate(instance, schema);
  const errors = validationInfo.errors.map(
    error => (
      {
        field: error.property,
        code: 1006,
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

standardRelayerApi.post('/order_config', (ctx) => {
  console.log('HTTP: POST order config');
  const orderConfigResponse = {
    senderAddress: NULL_ADDRESS,
    feeRecipientAddress: NULL_ADDRESS,
    makerFee: ZERO,
    takerFee: '1000',
  };
  if (validator.isValid(orderConfigResponse, schemas.relayerApiOrderConfigResponseSchema)) {
    ctx.status = 200;
    ctx.message = 'The additional fields necessary in order to submit an order to the relayer.';
    ctx.body = orderConfigResponse;
  } else {
    ctx.status = 400;
    ctx.message = 'Validation error';
    ctx.body = getValidationErrors(
      orderConfigResponse,
      schemas.relayerApiOrderConfigResponseSchema,
    );
  }
});

standardRelayerApi.post('/order', async (ctx) => {
  console.log('HTTP: POST order');
  const submittedOrder = ctx.request.body;
  const signedOrder = {
    ...submittedOrder,
    salt: new BigNumber(submittedOrder.salt),
    makerAssetAmount: new BigNumber(submittedOrder.makerAssetAmount),
    takerAssetAmount: new BigNumber(submittedOrder.takerAssetAmount),
    makerFee: new BigNumber(submittedOrder.makerFee),
    takerFee: new BigNumber(submittedOrder.takerFee),
    expirationTimeSeconds: new BigNumber(submittedOrder.expirationTimeSeconds),
    makerAssetAddress: `0x${submittedOrder.makerAssetData.slice(34)}`,
    makerAssetProxyId: submittedOrder.makerAssetData.slice(0, 10),
    takerAssetAddress: `0x${submittedOrder.takerAssetData.slice(34)}`,
    takerAssetProxyId: submittedOrder.takerAssetData.slice(0, 10),
  };
  const orderHash = orderHashUtils.getOrderHashHex(signedOrder);
  const order = new Order({
    ...signedOrder,
    orderHash,
    networkId: ctx.query.networkId,
  });
  if (validator.isValid(order, schemas.signedOrderSchema)) {
    try {
      await order.save();
    } catch (e) {
      console.log('CANT SAVE', e);
    }
    ctx.status = 200;
    ctx.message = 'OK';
    ctx.body = {};
  } else {
    ctx.status = 400;
    ctx.message = 'Validation error';
    ctx.body = getValidationErrors(order, schemas.signedOrderSchema);
  }
});

standardRelayerApi.get('/orderbook', async (ctx) => {
  console.log('HTTP: GET orderbook');
  const {
    baseAssetData,
    quoteAssetData,
    page = 1,
    perPage = 100,
    networkId = 50,
  } = ctx.query;
  const sort = (a, b) => {
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
  const bidOrders = await Order.find({
    takerAssetAddress: baseAssetData,
    makerAssetAddress: quoteAssetData,
    networkId,
  })
    .select('-_id -orderHash -networkId -makerAssetAddress -takerAssetAddress -makerAssetProxyId -takerAssetProxyId')
    .skip(perPage * (page - 1))
    .limit(parseInt(perPage, 10));
  const askOrders = await Order.find({
    takerAssetAddress: quoteAssetData,
    makerAssetAddress: baseAssetData,
    networkId,
  })
    .select('-_id -orderHash -networkId -makerAssetAddress -takerAssetAddress -makerAssetProxyId -takerAssetProxyId')
    .skip(perPage * (page - 1))
    .limit(parseInt(perPage, 10));
  const askOrdersSorted = askOrders.sort(sort);
  const bidOrdersSorted = bidOrders.sort(sort);

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
  if (validator.isValid(response, schemas.relayerApiOrderbookResponseSchema)) {
    ctx.status = 200;
    ctx.message = 'The sorted order book for the specified asset pair.';
    ctx.body = response;
  } else {
    ctx.status = 400;
    ctx.message = 'Validation error';
    ctx.body = getValidationErrors(response, schemas.relayerApiOrderbookResponseSchema);
  }
});

standardRelayerApi.get('/order/:orderHash', async (ctx) => {
  console.log('HTTP: GET ORDER BY HASH');
  const { networkId = 50 } = ctx.query;
  const order = await Order.findOne({
    orderHash: ctx.params.orderHash,
    networkId,
  })
    .select('-_id -orderHash -networkId -makerAssetAddress -takerAssetAddress -makerAssetProxyId -takerAssetProxyId');
  const response = {
    order,
    metaData: {},
  };
  if (validator.isValid(order, schemas.orderSchema)) {
    ctx.status = 200;
    ctx.message = 'The order and meta info associated with the orderHash';
    ctx.body = response;
  } else {
    ctx.status = 400;
    ctx.message = 'Validation error';
    ctx.body = getValidationErrors(order, schemas.orderSchema);
  }
});

standardRelayerApi.get('/fee_recipients', async (ctx) => {
  const {
    networkId = 50,
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
    .select('-_id -networkId -makerAssetAddress -takerAssetAddress -makerAssetProxyId -takerAssetProxyId')
    .skip(perPage * (page - 1))
    .limit(parseInt(perPage, 10));
  const response = {
    total: assetPairs.length,
    page,
    perPage,
    records: assetPairs,
  };
  if (validator.isValid(response, schemas.relayerApiAssetDataPairsResponseSchema)) {
    ctx.status = 200;
    ctx.message = 'Returns a collection of available asset pairs with some meta info';
    ctx.body = response;
  } else {
    ctx.status = 400;
    ctx.message = 'Validation error';
    ctx.body = getValidationErrors(response, schemas.relayerApiAssetDataPairsResponseSchema);
  }
});

standardRelayerApi.get('/orders', async (ctx) => {
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
    networkId = 50,
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
    .select('-_id -networkId -makerAssetAddress -takerAssetAddress -makerAssetProxyId -takerAssetProxyId')
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
    page,
    perPage,
    records,
  };
  if (validator.isValid(response, schemas.relayerApiOrdersResponseSchema)) {
    ctx.status = 200;
    ctx.message = 'A collection of 0x orders with meta-data as specified by query params';
    ctx.body = response;
  } else {
    ctx.status = 400;
    ctx.message = 'Validation error';
    ctx.body = getValidationErrors(response, schemas.relayerApiOrdersResponseSchema);
  }
});

// should be removed! Only for inserting testing data to db
// ************************************************
standardRelayerApi.get('/INSERT_ASSET_PAIRS', async (ctx) => {
  const mainPairs = mainAssetPairs.default.map((pair) => {
    pair.networkId = 1;
    return pair;
  });
  await AssetPair.insertMany(mainPairs);
  const kovanPairs = kovanAssetPairs.default.map((pair) => {
    pair.networkId = 42;
    return pair;
  });
  await AssetPair.insertMany(kovanPairs);
  const testPairs = testAssetPairs.default.map((pair) => {
    pair.networkId = 50;
    return pair;
  });
  await AssetPair.insertMany(testPairs);
  ctx.body = 'Should insert asset pairs';
});
// ************************************************

app.use(standardRelayerApi.routes());

export default app;
