import Koa from 'koa';
import Router from 'koa-router';

import {
  Order,
} from 'db';
import {
  coRedisClient,
} from 'redisClient';

const app = new Koa();

const sputnikApi = new Router({
  prefix: '/sputnik',
});

sputnikApi.get('/tradingHistory', async (ctx) => {
  const {
    baseAssetData,
    quoteAssetData,
  } = ctx.request.query;
  const orders = await Order.find({
    $or: [{
      makerAssetData: baseAssetData,
      takerAssetData: quoteAssetData,
    }, {
      makerAssetData: quoteAssetData,
      takerAssetData: baseAssetData,
    }],
  })
    .limit(500)
    .sort('-completedAt');
  ctx.status = 200;
  ctx.body = {
    records: orders,
  };
});

sputnikApi.post('/tradingInfo', async (ctx) => {
  const { pairs } = ctx.request.body;
  const idPairs = pairs.map(p => [
    p.assetDataA,
    p.assetDataB,
    p.networkId,
    'tradingInfo',
  ].join('_'));

  const idReversPairs = pairs.map(p => [
    p.assetDataB,
    p.assetDataA,
    p.networkId,
    'tradingInfo',
  ].join('_'));

  const allPairs = [
    ...idPairs,
    ...idReversPairs,
  ];

  const pairsTradingInfo = await Promise.all(
    allPairs.map(
      pair => (
        coRedisClient.get(pair)
          .then(
            data => (data ? JSON.parse(data) : null),
          )
      ),
    ),
  );
  ctx.status = 200;
  ctx.body = {
    records: pairsTradingInfo.filter(p => p !== null),
  };
});

app.use(sputnikApi.routes());

export default app;
