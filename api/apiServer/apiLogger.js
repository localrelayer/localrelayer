import {
  createLogger,
} from '../logger';

export const logger = createLogger(
  'apiServer',
//  'info',
);
logger.debug('apiServer logger was created');
