import jobs from '../kueJobs';
import {
  redisClient,
} from '../../redis';
import {
  createLogger,
} from '../../logger';


const logger = createLogger(
  'ethEventHandlerQueue',
);
logger.debug('ethEventHandlerQueue logger was created');

const ethEventHandler = (data, done) => {
  logger.debug('Handling');
  logger.debug(data);
  done();
};

/* Process this queue sequentially using only 1 job process */
export function runEthEventHandler() {
  jobs.process('EthEvent', 1, (job, done) => {
    logger.info('EthEvent queue started');
    ethEventHandler(job.data, done);
  });
  return jobs;
}
