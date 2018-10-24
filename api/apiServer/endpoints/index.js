import Koa from 'koa';
import Router from 'koa-router';


const app = new Koa();
const standardRelayerApi = new Router({
  prefix: '/v2',
});

standardRelayerApi.post('/getAssetPairs', async (ctx) => {
  ctx.status = 200;
  ctx.body = {
    total: 0,
    page: 1,
    perPage: 1000,
    records: [],
  };
});

app.use(standardRelayerApi.routes());

export default app;
