import {
  createLogger,
} from '../logger';

export const logger = createLogger(
  'sputnikSubscribe',
//  'info',
);
logger.debug('sputnikSubscribe logger was created');
