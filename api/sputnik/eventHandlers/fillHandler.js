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

const fillHandler = async (event, done) => {
  const t0 = performance.now();
  try {
    console.log('=============================================');
    console.log(event);
    console.log('Network ID', event.networkId);
    console.log('New 0x Fill Event');
    console.log(event.log.args);
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
    const { tradingInfoRedisKey } = await collectTradingInfo(order);

    redisClient.publish('tradingInfo', tradingInfoRedisKey);
    console.log('=============================================');
  } catch (error) {
    if (
      error.name === 'MongoError'
      && error.code === 11000
    ) {
      console.log('Duplicate key');
    } else {
      console.log(error);
    }
  }
  const t1 = performance.now();
  console.log(`Fill handler perf measure - ${t1 - t0} ml`);
  done();
};

/* Process this queue sequentially using only 1 job process */
export function runFillQueueHandler() {
  jobs.process('ExchangeFillEvent', 1, (job, done) => {
    fillHandler(job.data, done);
  });
}
