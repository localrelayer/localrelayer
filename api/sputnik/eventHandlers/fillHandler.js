import {
  performance,
} from 'perf_hooks';

import jobs from '../kueJobs';
import {
  redisClient,
} from '../../redis';
import {
  collectOrder,
  collectTradingInfo,
} from '../collect';
import {
  createLogger,
} from '../../logger';


const logger = createLogger(
  'fillHandlerQueue',
//  'info',
);
logger.debug('fillHandlerQueue logger was created');

const fillHandler = async (event, done) => {
  const t0 = performance.now();
  try {
    logger.debug('==================fillHandler===========================');
    logger.debug(event);
    logger.info('New 0x Fill Event');
    logger.info('Network ID', event.networkId);
    const {
      makerAssetData,
      takerAssetData,
      makerAssetFilledAmount,
      takerAssetFilledAmount,
      makerAddress,
      takerAddress,
      feeRecipientAddress,
      senderAddress,
      makerFeePaid,
      takerFeePaid,
      orderHash,
    } = event.log.args;

    const orderFields = {
      makerAddress,
      takerAddress,
      feeRecipientAddress,
      senderAddress,
      makerAssetAmount: makerAssetFilledAmount,
      takerAssetAmount: takerAssetFilledAmount,
      makerFee: makerFeePaid,
      takerFee: takerFeePaid,
      makerAssetData,
      takerAssetData,
      completedAt: new Date(),
      orderHash,
      networkId: event.networkId,
    };

    const order = await collectOrder(orderFields);
    const { tradingInfoRedisKey } = await collectTradingInfo(order, logger);

    redisClient.publish('tradingInfo', tradingInfoRedisKey);
    logger.debug('/==================fillHandler===========================');
  } catch (error) {
    if (
      error.name === 'MongoError'
      && error.code === 11000
    ) {
      logger.error('Duplicate key');
    } else {
      logger.error(error);
    }
  }
  const t1 = performance.now();
  logger.verbose(`Fill handler perf measure - ${t1 - t0} ml`);
  done();
};

/* Process this queue sequentially using only 1 job process */
export function runFillQueueHandler(cb) {
  jobs.process('ExchangeFillEvent', 1, (job, done) => {
    logger.info('ExchangeFillEvent queue started');
    fillHandler(job.data, done);
    if (cb) cb();
  });
  return jobs;
}
