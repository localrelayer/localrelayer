import 'module-alias/register';
import {
  performance,
} from 'perf_hooks';

import {
  redisClient,
} from 'redisClient';
import {
  createLogger,
} from 'logger';
import jobs from '../kueJobs';
import {
  collectOrder,
  collectTradingInfo,
} from '../collect';
import {
  Order,
} from 'db';


const logger = createLogger(
  'fillQueueHandler',
  process.env.LOG_LEVEL || 'silly',
  (
    require.main === module
    && process.env.DASHBOARD_PARENT !== 'true'
  ),
);
logger.debug('fillQueueHandler logger was created');

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
      orderHash,
      networkId: event.networkId,
      completedAt: new Date(),
    };

    let order = await Order.findOneAndUpdate({ orderHash },
      {
        completedAt: new Date(),
      },
      {
        returnNewDocument: true,
      });

    logger.debug('FOUND');
    logger.debug(order);

    if (!order) {
      order = await Order.create(orderFields);
    }

    logger.debug('SDADASDAS ORDER');
    logger.debug(order);

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
export function runFillQueueHandler() {
  jobs.process('ExchangeFillEvent', 1, (job, done) => {
    logger.info('ExchangeFillEvent queue started');
    fillHandler(job.data, done);
  });
  return jobs;
}

if (require.main === module) {
  runFillQueueHandler();
}
