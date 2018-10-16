import Koa from 'koa';
import Router from 'koa-router';
import moment from 'moment';
import {
  BigNumber,
} from '0x.js';

import {
  Order,
} from 'db';
import {
  coRedisClient,
} from 'redisClient';
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

sputnikApi.get('/tradingHistory', async (ctx) => {
  const {
    baseAssetData,
    quoteAssetData,
  } = ctx.request.query;
  const orders = await Order.find({
    $or: [{
      makerAssetData: baseAssetData,
      takerAssetData: quoteAssetData,
    }, {
      makerAssetData: quoteAssetData,
      takerAssetData: baseAssetData,
    }],
  })
    .limit(500)
    .sort('-completedAt');
  ctx.status = 200;
  ctx.body = {
    records: orders,
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
      completedAt: { $gt: start, $lt: end.add(1, 'day') },
    }],
  }).sort({ completedAt: -1 });

  logger.debug('RECORDS');
  logger.debug(records);

  const bars = records.reduce((acc, o) => {
    let period = moment(o.completedAt).utc();
    if (res.round) {
      period = nearestMinutes(res.round, period).unix();
    } else {
      period = period.startOf(res.startOf).unix();
    }
    const amount = o.makerAssetAmount;
    const price = new BigNumber(o.takerAssetAmount).div(o.makerAssetAmount);

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
    bars,
  };
});

app.use(sputnikApi.routes());

export default app;
