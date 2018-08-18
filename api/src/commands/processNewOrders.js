import uuid from 'uuid/v4';
import jobs from '../queue/jobs';
import { orders } from '../models';
import {
  appLogger as logger,
} from '../utils/logger';

(async () => {
  const failedOrders = await orders.query(qb => qb.where('status', 'new')).fetchAll();
  logger.log('info', 'ids of new orders %j', failedOrders.map(order => order.id));

  failedOrders.forEach((order) => {
    jobs.create(
      'MatcherQueue',
      {
        id: uuid(),
        orderId: order.id,
      },
    ).save();
  });
  // process.exit();
})();
