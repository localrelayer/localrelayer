import jobs from './jobs';
import {
  orders,
} from '../models';
import findMatchedOrder from '../api/engine/finder';
import {
  appLogger as logger,
} from '../utils/logger';
import {
  catchError,
} from '../utils/helpers';

jobs.process('MatcherQueue', 1, async (job, done) => {
  logger.log('info', '%s', job.type);

  if (!job.data.orderId) {
    logger.log('error', 'No order id in queue');
    return;
  }

  let fillRequests = [];

  const order = await orders.where('id', job.data.orderId).fetch();

  try {
    fillRequests = await findMatchedOrder({ order });
  } catch (e) {
    logger.log('error', 'Cant find matched %s', e);
    catchError(e);
  }

  if (!fillRequests.length) {
    logger.log('error', 'No matched orders');
    done(new Error('No matched orders'));
    return;
  }

  // jobs
  //   .create(
  //     'FillQueue',
  //     {
  //       id: uuid(),
  //       orderId: order.id,
  //       fillRequests,
  //     },
  //   )
  //   .save();

  done();
});
