import Koa from 'koa';
import Router from 'koa-router';
import bodyParser from 'koa-bodyparser';
import mount from 'koa-mount';
import cors from '@koa/cors';

import endpoints from './endpoints';
import sputnikEndpoints from '../sputnik/endpoints';
import {
  logger,
} from './apiLogger';
import config from '../config';

const app = new Koa();
const router = new Router();

if (config.showLogs) {
  app.use(logger);
}
app
  .use(cors())
  .use(bodyParser())
  .use(router.routes())
  .use(mount(sputnikEndpoints))
  .use(mount(endpoints));


export {
  app,
};

export function runApiServer() {
  return app.listen(config.apiPort, () => {
    logger.info(`App started on port ${config.apiPort}`);
  });
}
