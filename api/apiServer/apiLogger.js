import {
  createLogger,
} from 'logger';

export const logger = createLogger(
  'apiServer',
  process.env.LOG_LEVEL || 'silly',
  process.env.DASHBOARD_PARENT !== 'true',
);
logger.debug('apiServer logger was created');
