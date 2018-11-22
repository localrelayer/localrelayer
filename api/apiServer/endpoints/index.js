import Koa from 'koa';
import Router from 'koa-router';
import {
  schemas,
} from '@0x/json-schemas';

import {
  logger,
} from 'apiLogger';
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
  createOrdersEndpoint,
} from './orders';
import {
  createAssetPairsEndpoint,
} from './assetPairs';

const app = new Koa();
const standardRelayerApi = new Router({
  prefix: '/v2',
});
createPostOrderEndpoint(standardRelayerApi);
createOrderBookEndpoint(standardRelayerApi);
createOrdersEndpoint(standardRelayerApi);
createAssetPairsEndpoint(standardRelayerApi);

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

standardRelayerApi.get('/fee_recipients', async (ctx) => {
  const {
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
      getOrderConfig().feeRecipientAddress,
    ],
  };
});

app.use(standardRelayerApi.routes());

export default app;
