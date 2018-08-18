import uuid from 'uuid/v4';
import jobs from '../queue/jobs';
import { pgBookshelf as pg } from '../db';
import { orders } from '../models';
import {
  appLogger as logger,
} from '../utils/logger';

const ordersCollection = pg.Collection.extend({
  model: orders
});

(async () => {
  const failedOrders = await orders.query(qb => qb.where('status', 'failed')).fetchAll();
  logger.log('info', 'ids of failed orders %j', failedOrders.map(order => order.id));

  // Setting all orders as new
  await ordersCollection
    .forge(
      failedOrders.map(order => ({
        ...order.attributes,
        status: 'new',
        completed_at: null,
      }))
    )
    .invokeThen('save');

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
