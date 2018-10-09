import Koa from 'koa';
import Router from 'koa-router';
import logger from 'koa-logger';
import bodyParser from 'koa-bodyparser';
import mount from 'koa-mount';
import cors from '@koa/cors';

import endpoints from './endpoints';
import sputnikEndpoints from '../sputnik/endpoints';
import config from '../config';


const app = new Koa();
const router = new Router();

if (config.showLogs) {
  app.use(logger());
}
app
  .use(cors())
  .use(bodyParser())
  .use(router.routes())
  .use(mount(sputnikEndpoints))
  .use(mount(endpoints));

app.listen(config.apiPort, () => {
  console.log(`App started on port ${config.apiPort}`);
});
