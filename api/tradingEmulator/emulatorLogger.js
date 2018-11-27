import {
  createLogger,
} from 'logger';

export const logger = createLogger(
  'tradingEmulator',
  process.env.LOG_LEVEL || 'silly',
  process.env.DASHBOARD_PARENT !== 'true',
);
logger.debug('tradingEmulator logger was created');
