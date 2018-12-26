import Koa from 'koa';
import fetch from 'cross-fetch';
import Router from 'koa-router';
import moment from 'moment';
import {
  BigNumber,
} from '0x.js';

import {
  Order,
  Transaction,
} from 'db';
import {
  coRedisClient,
  redisClient,
} from 'redisClient';
import {
  constructOrderRecord,
  clearOrderWithMetaFields,
  COINMARKET_API_KEY,
} from 'utils';

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
    transactionInstance.completedAt = new Date().toISOString();
  }
  const saveTransaction = await transactionInstance.save();

  // Only for pending transaction with fill orders
  if (transaction.meta?.filledOrders && !Number.isInteger(transaction.status)) {
    const { filledOrders } = transaction.meta;

    await Promise.all(filledOrders.map(async (order) => {
      const foundOrder = await Order.findOne({
        orderHash: order.orderHash,
        isValid: true,
      });
      if (!foundOrder) {
        return null;
      }
      const remainingFillableTakerAssetAmount = new BigNumber(
        foundOrder.remainingFillableTakerAssetAmount,
      ).minus(order.filledAmount);

      const remainingFillableMakerAssetAmount = new BigNumber(
        foundOrder.makerAssetAmount,
      )
        .times(remainingFillableTakerAssetAmount)
        .div(foundOrder.takerAssetAmount);

      const updateQuery = {
        remainingFillableMakerAssetAmount,
        remainingFillableTakerAssetAmount,
      };

      if (remainingFillableTakerAssetAmount.eq(0)) {
        updateQuery.isValid = false;
        updateQuery.isShadowed = true;
      }

      const a = await Order.update(
        {
          orderHash: order.orderHash,
        },
        updateQuery,
      );
      return a;
    }));

    const updatedOrders = await Order.find({
      $or: filledOrders.map(({ orderHash }) => ({
        orderHash,
      })),
    }).lean();

    updatedOrders.forEach((order) => {
      redisClient.publish(
        'orders',
        JSON.stringify(
          constructOrderRecord(
            clearOrderWithMetaFields(order),
          ),
        ),
      );
    });
  }

  ctx.message = 'OK';
  ctx.status = 200;
  ctx.body = {
    records: [saveTransaction],
  };
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
  }).countDocuments();
  const dbReq = Transaction.find({
    ...baseQuery,
  });
  if (type !== 'pending') {
    dbReq
      .skip(perPage * (page - 1))
      .limit(parseInt(perPage, 10))
      .sort('-completedAt');
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
    makerAddress,
    networkId = 1,
  } = ctx.request.query;

  const query = baseAssetData && quoteAssetData ? {
    networkId,
    $or: [{
      makerAssetData: baseAssetData,
      takerAssetData: quoteAssetData,
      filledTakerAssetAmount: { $ne: 0 },
    }, {
      makerAssetData: quoteAssetData,
      takerAssetData: baseAssetData,
      filledTakerAssetAmount: { $ne: 0 },
    }],
  }
    : {
      networkId,
      filledTakerAssetAmount: { $ne: 0 },
    };

  if (makerAddress) {
    query.makerAddress = makerAddress;
  }

  const orders = await Order.find(query)
    .limit(500)
    .sort('-lastFilledAt')
    .lean();

  ctx.status = 200;
  ctx.body = {
    records: orders.map(constructOrderRecord),
  };
});

sputnikApi.get('/openOrders', async (ctx) => {
  const {
    traderAddress,
    networkId,
  } = ctx.request.query;
  const orders = await Order.find({
    networkId,
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
  }).sort('lastFilledAt');

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

sputnikApi.get('/fetchMarketQuotes', async (ctx) => {
  const cachedMarketQuotes = await coRedisClient.get('marketQuotes');

  if (cachedMarketQuotes) {
    ctx.status = 200;
    ctx.body = JSON.parse(cachedMarketQuotes);
  } else {
    const { symbols } = ctx.request.query;
    const url = new URL('https://pro-api.coinmarketcap.com/v1/cryptocurrency/quotes/latest');
    url.search = new URLSearchParams({
      symbol: symbols,
    });
    const response = await fetch(
      url,
      {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          'Accept-Encoding': 'deflate, gzip',
          'X-CMC_PRO_API_KEY': COINMARKET_API_KEY,
        },
      },
    );
    const quotesData = await response.json();

    if (response.status === 200) {
      const marketQuotes = {
        ...Object.keys(quotesData.data).reduce((acc, symbol) => ({
          ...acc,
          [symbol]: quotesData.data[symbol],
        }), {}),
      };
      await coRedisClient.set(
        'marketQuotes',
        JSON.stringify(marketQuotes),
        'EX',
        // 30 mins because 1 request from prod, 3 from us, sum: 48 * 4 = 192 < 333 per day
        60 * 30,
      );
      ctx.status = 200;
      ctx.body = marketQuotes;
    } else {
      ctx.status = response.status;
      ctx.body = {};
    }
  }
});

app.use(sputnikApi.routes());

export default app;
