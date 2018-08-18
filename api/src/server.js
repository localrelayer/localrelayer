import Koa from 'koa';
import Router from 'koa-router';
import logger from 'koa-logger';
import cors from 'kcors';
import bodyParser from 'koa-bodyparser';
import mount from 'koa-mount';
import swaggerJSDoc from 'swagger-jsdoc';
import serve from 'koa-static';
import Raven from 'raven';

import pkg from '../package.json';
import api from './api';
import config from './config';


const app = new Koa();
if (config.showLogs) {
  app.use(logger());
}
app
  .use(cors())
  .use(bodyParser());

if (config.showDocs) {
  app.use(serve(`${process.cwd()}/docs/`));
}

if (config.useSentry) {
  Raven.config('https://b54c33ad92334090b5c82c3fad2d762f@sentry.io/1210489').install();
  app.on('error', (err) => {
    Raven.captureException(err, (err, eventId) => {
      console.log(`Reported error: ${eventId}`);
    });
  });
}

const swaggerDefinition = {
  info: {
    title: 'Instex API',
    version: pkg.version,
    description: pkg.description,
  },
  host: 'localhost:3001',
  basePath: '/api/',
};

const swaggerOptions = {
  swaggerDefinition,
  apis: [
    './src/api/**/*.js',
    './src/api/**/*yaml',
    './src/models/**/*yaml',
  ],
};

const router = new Router();
router.get('/swagger.json', async (ctx) => {
  const swaggerSpec = swaggerJSDoc(swaggerOptions);
  ctx.body = swaggerSpec;
});
app.use(router.routes());

app.use(mount(api));

export { app };
