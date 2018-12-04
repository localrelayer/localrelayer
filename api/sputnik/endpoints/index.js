import Koa from 'koa';
import Router from 'koa-router';
import moment from 'moment';
import {
  BigNumber,
} from '0x.js';
import {
  ExchangeContractErrs,
} from '@0x/types';

import {
  Order,
  Transaction,
} from 'db';
import {
  coRedisClient,
} from 'redisClient';
import {
  constructOrderRecord,
} from 'utils';
import {
  logger,
} from 'apiLogger';

const app = new Koa();

const sputnikApi = new Router({
  prefix: '/sputnik',
});

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
  },
};

function nearestMinutes(interval, someMoment) {
  const roundedMinutes = Math.round(someMoment.clone().minute() / interval) * interval;
  return someMoment.clone().minute(roundedMinutes).second(0);
}

sputnikApi.post('/transactions', async (ctx) => {
  const transaction = ctx.request.body;
  let transactionInstance = null;
  transactionInstance = await Transaction.findOne({
    transactionHash: transaction.transactionHash,
    networkId: transaction.networkId,
  })
    || (
      new Transaction({
        createdAt: new Date().toISOString(),
      })
    );
  Object.keys(transaction).reduce(
    (acc, key) => {
      transactionInstance[key] = transaction[key];
      return acc;
    },
    transactionInstance,
  );
  if (transaction.status === 1) {
    transactionInstance.updatedAt = new Date().toISOString();
  }
  await transactionInstance.save();
  ctx.message = 'OK';
  ctx.status = 200;
  ctx.body = {};
});

sputnikApi.get('/transactions', async (ctx) => {
  const {
    address,
    type,
    page = 1,
    perPage = 100,
    networkId = 1,
  } = ctx.query;

  const baseQuery = {
    address,
    networkId,
    status: {
      $exists: type !== 'pending',
    },
  };
  const total = await Transaction.find({
    ...baseQuery,
  }).count();
  const dbReq = Transaction.find({
    ...baseQuery,
  });
  if (type !== 'pending') {
    dbReq
      .skip(perPage * (page - 1))
      .limit(parseInt(perPage, 10));
  }
  const transactions = await dbReq.lean();
  ctx.message = 'OK';
  ctx.body = {
    records: transactions,
    page,
    perPage,
    total,
  };
});

sputnikApi.get('/tradingHistory', async (ctx) => {
  const {
    baseAssetData,
    quoteAssetData,
  } = ctx.request.query;
  const orders = await Order.find({
    $or: [{
      makerAssetData: baseAssetData,
      takerAssetData: quoteAssetData,
      error: ExchangeContractErrs.OrderRemainingFillAmountZero,
    }, {
      makerAssetData: quoteAssetData,
      takerAssetData: baseAssetData,
      error: ExchangeContractErrs.OrderRemainingFillAmountZero,
    }, {
      filledTakerAssetAmount: { $ne: 0 },
    }],
  })
    .limit(500)
    .sort('-lastFilledAt')
    .lean();
  ctx.status = 200;
  ctx.body = {
    records: orders.map(constructOrderRecord),
  };
});

sputnikApi.get('/openOrders', async (ctx) => {
  const { traderAddress } = ctx.request.query;
  const orders = await Order.find({
    $and: [
      {
        $or: [
          {
            isValid: true,
          },
          {
            isValid: false,
            isShadowed: true,
          },
        ],
      },
      {
        $or: [
          {
            makerAddress: traderAddress,
          },
          {
            takerAddress: traderAddress,
          },
        ],
      },
    ],
  })
    .lean();
  ctx.status = 200;
  ctx.body = {
    records: orders.map(constructOrderRecord),
  };
});

sputnikApi.post('/tradingInfo', async (ctx) => {
  const { pairs } = ctx.request.body;
  const idPairs = pairs.map(p => [
    p.assetDataA,
    p.assetDataB,
    p.networkId,
    'tradingInfo',
  ].join('_'));

  const idReversPairs = pairs.map(p => [
    p.assetDataB,
    p.assetDataA,
    p.networkId,
    'tradingInfo',
  ].join('_'));

  const allPairs = [
    ...idPairs,
    ...idReversPairs,
  ];

  const pairsTradingInfo = await Promise.all(
    allPairs.map(
      pair => (
        coRedisClient.get(pair)
          .then(
            data => (data ? JSON.parse(data) : null),
          )
      ),
    ),
  );
  ctx.status = 200;
  ctx.body = {
    records: pairsTradingInfo.filter(p => p !== null),
  };
});

sputnikApi.get('/bars', async (ctx) => {
  const {
    baseAssetData,
    quoteAssetData,
    from,
    to,
    resolution,
  } = ctx.request.query;

  const res = resolutionsMap[resolution];
  const start = moment.unix(from).startOf(res.startOf);
  const end = moment.unix(to).startOf(res.startOf);

  const records = await Order.find({
    $and: [{
      $or: [{
        makerAssetData: baseAssetData,
        takerAssetData: quoteAssetData,
      }, {
        makerAssetData: quoteAssetData,
        takerAssetData: baseAssetData,
      }],
      lastFilledAt: { $gt: start, $lt: end.add(1, 'day') },
    }],
  }).sort({ lastFilledAt: -1 });

  logger.debug('RECORDS');
  logger.debug(records);

  const bars = records.reduce((acc, order) => {
    let period = moment(order.lastFilledAt).utc();
    if (res.round) {
      period = nearestMinutes(res.round, period).unix();
    } else {
      period = period.startOf(res.startOf).unix();
    }

    const [
      price,
      amount,
    ] = (
      order.makerAssetData === baseAssetData
        ? [
          new BigNumber(order.takerAssetAmount).div(order.makerAssetAmount),
          order.makerAssetAmount,
        ]
        : [
          new BigNumber(order.makerAssetAmount).div(order.takerAssetAmount),
          order.takerAssetAmount,
        ]
    );

    if (acc[period]) {
      acc[period].volume += parseFloat(amount);
      acc[period].low = acc[period].low > parseFloat(price)
        ? parseFloat(price) : acc[period].low;
      acc[period].high = acc[period].high < parseFloat(price)
        ? parseFloat(price) : acc[period].high;
      acc[period].close = parseFloat(price);
    } else {
      acc[period] = {
        time: period * 1000,
        open: parseFloat(price),
        close: parseFloat(price),
        volume: parseFloat(amount),
        low: parseFloat(price),
        high: parseFloat(price),
      };
    }
    return acc;
  }, {});
  ctx.status = 200;
  ctx.body = {
    items: bars,
  };
});

app.use(sputnikApi.routes());

export default app;
