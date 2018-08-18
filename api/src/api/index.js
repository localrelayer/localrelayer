import Koa from 'koa';
import Router from 'koa-router';

import tokensRouter from './routes/tokens/routes';
import ordersRouter from './routes/orders/routes';


const app = new Koa();

const router = new Router({
  prefix: '/api'
});

router.use(tokensRouter.routes());
router.use(ordersRouter.routes());

app.use(router.routes());

export default app;
