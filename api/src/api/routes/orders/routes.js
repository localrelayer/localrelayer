import Router from 'koa-router';
import JsonApiQueryParserClass from 'jsonapi-query-parser';
import uuid from 'uuid/v4';
import moment from 'moment';
import jobs from '../../../queue/jobs';
import socket from '../../../socket';
import {
  pgKnex as knex
} from '../../../db';

import {
  validate,
  cleanAttributes,
} from '../../validate';
import {
  filterOrderSchemas,
  createOrderSchemas,
  updateOrderSchemas,
} from '../../../schemas/orders';
import {
  jsonApiCreateSchema,
} from '../../../schemas/common';
import {
  orders,
  ordersDefaultFields,
} from '../../../models/orders';
import {
  mapper,
} from '../../../utils/jsonApiMapper';
import {
  saveResource,
} from '../../../utils/saveResource';
import {
  web3,
  checkFee,
  formatZrxOrder,
  watcherPromise,
  zeroEx,
} from '../../../web3';
import findMatchedOrders from '../../engine/finder';


const JsonApiQueryParser = new JsonApiQueryParserClass();

const router = new Router({
  prefix: '/orders'
});

async function getOrders({
  ctx,
  data,
  isCollection,
  successStatus,
  returnItems,
  withDeleted,
}) {
  try {
    await validate(filterOrderSchemas, data);
  } catch (errors) {
    ctx.status = 400;
    ctx.body = {
      errors,
    };
    return;
  }
  const filter = data.filter;
  const search = data.search;
  const query = orders.forge();
  const items = await query.fetchJsonApi({
    withDeleted,
    fields: (data.fields && Object.keys(data.fields).length) ? data.fields : {
      orders: ordersDefaultFields.fields,
    },
    page: (data.page && Object.keys(data.page).length) ? data.page : {
      limit: isCollection ? 500 : 1,
      offset: 0,
    },
    sort: (data.sort && data.sort.length) ? data.sort : ['-id'],
    include: (data.include && data.include.length) ? data.include : ordersDefaultFields.include,
    filter,
    search,
  });

  if (returnItems) {
    return items;
  }
  const mappedOrders = mapper.map(items, 'orders');
  ctx.status = successStatus;
  if (isCollection) {
    ctx.body = {
      meta: items.pagination,
      ...mappedOrders,
    };
  } else if (!mappedOrders.data[0]) {
    ctx.status = 404;
  } else {
    ctx.body = {
      data: mappedOrders.data[0],
      included: mappedOrders.included,
    };
  }
}

async function saveOrder(ctx, method) {
  // const companyId = ctx.state.currentCompany.get('id');
  const jsonApiSaveSchema = jsonApiCreateSchema;
  const isCreate = method === 'post';
  const saveSchemas = isCreate ? createOrderSchemas() : updateOrderSchemas();

  try {
    await validate([jsonApiSaveSchema], ctx.request.body);
  } catch (errors) {
    ctx.status = 400;
    ctx.body = {
      errors,
    };
    return;
  }
  const attributes = cleanAttributes(
    ctx.request.body.data.attributes || {},
    ordersDefaultFields.fields.reduce((p, c) => ({ ...p, [c]: true }), {})
  );
  if (isCreate) {
    attributes.created_at = moment().toISOString();
    attributes.status = 'new';
  } else {
    attributes.id = ctx.request.body.data.id;
  }
  const relationships = ctx.request.body.data.relationships;
  try {
    await validate(saveSchemas, attributes);
  } catch (errors) {
    ctx.status = 400;
    ctx.body = {
      errors,
    };
    return;
  }

  try {
    const savedOrder = await saveResource({
      model: orders,
      attributes,
      relationships,
      allowedCreateRelationships: [],
      allowedUpdateRelationships: ordersDefaultFields.include,
    });

    if (savedOrder.attributes.zrxOrder.ecSignature) {
      const watcher = await watcherPromise;
      watcher.addOrder(formatZrxOrder(savedOrder.attributes.zrxOrder));
    }

    const successStatus = isCreate ? 201 : 200;

    await getOrders({
      ctx,
      data: {
        filter: {
          id: savedOrder.get('id')
        }
      },
      isCollection: false,
      successStatus,
      returnItems: false,
      withDeleted: false,
    });
  } catch (err) {
    console.log(err);
    ctx.status = 500;
    ctx.body = {
      errorMessage: `Something wrong ${err.toString()}`,
    };
  }
}

/**
  * @swagger
  * /orders/filter:
  *   post:
  *     summary: Filter orders
  *     description: Fetch orders
  *     tags: [Orders]
  *     operationId: FilterOrders
  *     consumes:
  *       - application/json
  *     produces:
  *       - application/json
  *     security:
  *       - JWT: []
  *     parameters:
  *       - $ref: '#/parameters/orders-filter'
  *     responses:
  *       200:
  *         description: Success response
  *       401:
  *         description: Unauthorized
*/
router.post('/filter', async (ctx) => {
  const data = ctx.request.body;
  await getOrders({
    ctx,
    data,
    isCollection: true,
    successStatus: 200,
    returnItems: false,
    withDeleted: data.withDeleted || false,
  });
});
router.get('/', async (ctx) => {
  const data = JsonApiQueryParser.parseRequest(ctx.url).queryData;
  await getOrders({
    ctx,
    data,
    isCollection: true,
    successStatus: 200,
    returnItems: false,
    withDeleted: data.withDeleted || false,
  });
});


router.post('/match', async (ctx) => {
  try {
    const { order } = ctx.request.body;
    const matchedOrders = await findMatchedOrders({ attributes: order });
    ctx.status = 200;
    ctx.body = {
      matchedOrders,
    };
  } catch (e) {
    console.log(e.message);
    ctx.status = 400;
    ctx.body = {
      errorMessage: `Can't find matched, ${e.message}`,
    };
  }
});

/**
  * @swagger
  * /orders/bars:
  *   post:
  *     summary: Get bars for charts
  *     description: Get bars for charts
  *     tags: [Orders]
  *     operationId: GetBars
  *     consumes:
  *       - application/json
  *     produces:
  *       - application/json
  *     security:
  *       - JWT: []
  *     parameters:
  *       - $ref: '#/parameters/get-bars'
  *     responses:
  *       201:
  *         description: Resource created
  *       400:
  *         description: Validation error
*/
router.post('/bars', async (ctx) => {
  const {
    tokenAddress,
    from,
    to,
    resolution,
  } = ctx.request.body;
  const resolutionsMap = {
    1: {
      startOf: 'minute',
    },
    10: {
      startOf: 'minute',
      round: 10,
    },
    30: {
      startOf: 'minute',
      round: 30,
    },
    60: {
      startOf: 'hour',
    },
    D: {
      startOf: 'day',
    }
  };

  function nearestMinutes(interval, someMoment) {
    const roundedMinutes = Math.round(someMoment.clone().minute() / interval) * interval;
    return someMoment.clone().minute(roundedMinutes).second(0);
  }

  const res = resolutionsMap[resolution];
  const start = moment.unix(from).startOf(res.startOf);
  const end = moment.unix(to).startOf(res.startOf);
  const orders =
    await knex('orders')
      .where('token_address', tokenAddress)
      .andWhere('is_history', true)
      .andWhere('completed_at', '>=', start)
      // somewhy trading view doesn't include in 'to' today date
      .andWhere('completed_at', '<=', end.add(1, 'day'))
      .orderBy('completed_at', '<=');

  const bars = orders.reduce((acc, order) => {
    let period = moment(order.completed_at).utc();
    if (res.round) {
      period = nearestMinutes(res.round, period).unix();
    } else {
      period = period.startOf(res.startOf).unix();
    }
    if (acc[period]) {
      acc[period].volume += parseFloat(order.amount);
      acc[period].low = acc[period].low > parseFloat(order.price) ? parseFloat(order.price) : acc[period].low;
      acc[period].high = acc[period].high < parseFloat(order.price) ? parseFloat(order.price) : acc[period].high;
      acc[period].close = parseFloat(order.price);
    } else {
      acc[period] = {
        time: period * 1000,
        open: parseFloat(order.price),
        close: parseFloat(order.price),
        volume: parseFloat(order.amount),
        low: parseFloat(order.price),
        high: parseFloat(order.price),
      };
    }
    return acc;
  }, {});
  ctx.body = bars;
});

/**
  * @swagger
  * /orders/{orderId}:
  *   get:
  *     summary: Get order by order id
  *     description: Get order by order id
  *     tags: [Orders]
  *     operationId: GetOrderById
  *     consumes:
  *       - application/json
  *     produces:
  *       - application/json
  *     security:
  *       - JWT: []
  *     parameters:
  *       - name: orderId
  *         in: path
  *         type: integer
  *         required: true
  *         example: 1
  *     responses:
  *       200:
  *         description: Success response
  *       404:
  *         description: Not found
*/
router.get('/:id', async (ctx) => {
  await getOrders({
    ctx,
    data: {
      filter: {
        id: ctx.params.id
      }
    },
    isCollection: false,
    successStatus: 200,
    returnItems: false,
    withDeleted: false,
  });
});

/**
  * @swagger
  * /orders:
  *   post:
  *     summary: Create a new order
  *     description: Create a new order
  *     tags: [Orders]
  *     operationId: CreateOrder
  *     consumes:
  *       - application/json
  *     produces:
  *       - application/json
  *     security:
  *       - JWT: []
  *     parameters:
  *       - $ref: '#/parameters/orders-create-new'
  *     responses:
  *       201:
  *         description: Resource created
  *       400:
  *         description: Validation error
*/
router.post('/', async (ctx) => {
  await saveOrder(ctx, 'post');
});

/**
  * @swagger
  * /orders/{orderId}/cancel:
  *   post:
  *     summary: Cancel order
  *     description: Cancel order
  *     tags: [Orders]
  *     operationId: CancelOrder
  *     consumes:
  *       - application/json
  *     produces:
  *       - application/json
  *     security:
  *       - JWT: []
  *     parameters:
  *       - name: orderId
  *         in: path
  *         type: integer
  *         required: true
  *         example: 1
  *       - name: body
  *         in: body
  *         required: true
  *         schema:
  *           type: object
  *           properties:
  *             signature:
  *               type: string
  *               example: string
  *     responses:
  *       200:
  *         description: Success response
  *       401:
  *         description: Wrong signature
  *       400:
  *         description: Error
*/
router.post('/:id/cancel', async (ctx) => {
  const maker = await web3.eth.accounts.recover(
    'Confirmation to cancel order',
    ctx.request.body.signature,
  );
  const orders =
    await knex('orders')
      .where('id', ctx.params.id)
      .andWhere(qb => qb.where('status', 'in', ['failed', 'new']));
  const orderMaker = orders.length ? orders[0].zrxOrder.maker : null;
  if (maker.toLowerCase() === orderMaker) {
    await knex('orders').where('id', ctx.params.id).update({
      status: 'canceled',
      canceled_at: new Date(),
    });
    ctx.status = 200;
  } else {
    ctx.status = 401;
  }
});

/**
  * @swagger
  * /orders/{orderId}/cancel:
  *   post:
  *     summary: Cancel order
  *     description: Cancel order
  *     tags: [Orders]
  *     operationId: CancelOrder
  *     consumes:
  *       - application/json
  *     produces:
  *       - application/json
  *     security:
  *       - JWT: []
  *     parameters:
  *       - name: orderId
  *         in: path
  *         type: integer
  *         required: true
  *         example: 1
  *       - name: body
  *         in: body
  *         required: true
  *         schema:
  *           type: object
  *           properties:
  *             signature:
  *               type: string
  *               example: string
  *     responses:
  *       200:
  *         description: Success response
  *       401:
  *         description: Wrong signature
  *       400:
  *         description: Error
*/

router.post('/update', async (ctx) => {
  const {
    matchedOrders,
    orderAttributes,
    txHash,
  } = ctx.request.body;
  jobs
    .create(
      'UpdateQueue',
      {
        id: uuid(),
        orderAttributes,
        filledOrders: matchedOrders,
        txHash,
      },
    )
    .save();

  ctx.status = 200;
});

export default router;
