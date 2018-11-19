import 'module-alias/register';
import Koa from 'koa';
import Router from 'koa-router';
import bodyParser from 'koa-bodyparser';
import mount from 'koa-mount';
import cors from '@koa/cors';

import {
  logger,
} from 'apiLogger';
import config from 'config';
import apiEndpoints from './endpoints';
import sputnikEndpoints from '../sputnik/endpoints';

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
  .use(mount(apiEndpoints));


export {
  app,
};

export function runApiServer() {
  return app.listen(config.apiPort, () => {
    logger.info(`App started on port ${config.apiPort}`);
  });
}
