import {
  createLogger,
} from 'logger';


export const logger = createLogger(
  'sputnikSubscribe',
  process.env.LOG_LEVEL || 'silly',
  process.env.DASHBOARD_PARENT !== 'true',
);
logger.debug('sputnikSubscribe logger was created');
