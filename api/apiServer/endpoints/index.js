import Koa from 'koa';
import Router from 'koa-router';

import {
  ZERO,
  NULL_ADDRESS,
} from '../../src/scenarios/utils/constants';
import {
  Order,
} from '../../db';

const zeroEx = require('0x.js');

const app = new Koa();
const standardRelayerApi = new Router({
  prefix: '/v2',
});

const orders = [];
const ordersByHash = {};

const renderOrderbookResponse = (baseAssetData, quoteAssetData) => {
  const bidOrders = orders.filter(
    order => order.takerAssetData === baseAssetData && order.makerAssetData === quoteAssetData,
  );
  const askOrders = orders.filter(
    order => order.takerAssetData === quoteAssetData && order.makerAssetData === baseAssetData,
  );
  const bidApiOrders = bidOrders.map(order => ({ metaData: {}, order }));
  const askApiOrders = askOrders.map(order => ({ metaData: {}, order }));
  return {
    bids: {
      records: bidApiOrders,
      page: 1,
      perPage: 100,
      total: bidOrders.length,
    },
    asks: {
      records: askApiOrders,
      page: 1,
      perPage: 100,
      total: askOrders.length,
    },
  };
};

standardRelayerApi.post('/getAssetPairs', async (ctx) => {
  ctx.status = 200;
  ctx.body = {
    total: 0,
    page: 1,
    perPage: 1000,
    records: [],
  };
});

standardRelayerApi.post('/order_config', (ctx) => {
  console.log('HTTP: POST order config');
  const orderConfigResponse = {
    senderAddress: NULL_ADDRESS,
    feeRecipientAddress: NULL_ADDRESS,
    makerFee: ZERO,
    takerFee: '1000',
  };
  ctx.status = 200;
  ctx.body = orderConfigResponse;
});

standardRelayerApi.post('/order', async (ctx) => {
  console.log('HTTP: POST order');
  const submittedOrder = ctx.request.body;
  const signedOrder = {
    ...submittedOrder,
    salt: new zeroEx.BigNumber(submittedOrder.salt),
    makerAssetAmount: new zeroEx.BigNumber(submittedOrder.makerAssetAmount),
    takerAssetAmount: new zeroEx.BigNumber(submittedOrder.takerAssetAmount),
    makerFee: new zeroEx.BigNumber(submittedOrder.makerFee),
    takerFee: new zeroEx.BigNumber(submittedOrder.takerFee),
    expirationTimeSeconds: new zeroEx.BigNumber(submittedOrder.expirationTimeSeconds),
  };
  const orderHash = zeroEx.orderHashUtils.getOrderHashHex(signedOrder);
  const order = new Order({
    ...signedOrder,
    orderHash,
  });
  order.save();
  ordersByHash[orderHash] = signedOrder;
  orders.push(signedOrder);
  ctx.status = 200;
  ctx.body = {};
});

standardRelayerApi.get('/orderbook', async (ctx) => {
  console.log('HTTP: GET orderbook');
  const { baseAssetData } = ctx.query;
  const { quoteAssetData } = ctx.query;
  const orderbookResponse = renderOrderbookResponse(baseAssetData, quoteAssetData);
  ctx.status = 200;
  ctx.body = orderbookResponse;
});

app.use(standardRelayerApi.routes());

export default app;
