import {
  BigNumber,
} from '0x.js';
import {
  generatePseudoRandomSalt,
  orderHashUtils,
} from '@0x/order-utils';
import {
  Web3Wrapper,
} from '@0x/web3-wrapper';
import * as R from 'ramda';
import moment from 'moment';
import assetPairsMainJson from './assetPairs.main.json';
import assetPairsKovanJson from './assetPairs.kovan.json';
import assetPairsTestJson from './assetPairs.test.json';

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

const assetPairsJson = {
  1: assetPairsMainJson,
  42: assetPairsKovanJson,
  50: assetPairsTestJson,
};

const NULL_ADDRESS = '0x0000000000000000000000000000000000000000';

/* https://github.com/Marak/faker.js/blob/master/lib/finance.js#L223 */
function randomEthereumAddress() {
  const hexadecimalSymbols = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'a', 'b', 'c', 'd', 'e', 'f'];
  const randomHex = Array(40).fill().map(
    () => (
      hexadecimalSymbols[Math.floor(Math.random() * hexadecimalSymbols.length)]
    ),
  );
  return `0x${randomHex.join('')}`;
}

function generateRandomMakerAssetAmount() {
  return Web3Wrapper.toBaseUnitAmount(new BigNumber((Math.round(Math.random() * 100) + 10)), 18);
}

function generateRandomTakerAssetAmount() {
  return Web3Wrapper.toBaseUnitAmount(new BigNumber((Math.round(Math.random() * 5)) + 15), 18);
}

export function getAssetPairs({
  assetDataA,
  assetDataB,
  networkId = 1,
  page = 1,
  perPage = 100,
} = {
  networkId: 1,
  page: 1,
  perPage: 100,
}) {
  const offset = (page - 1) * perPage;
  const records = assetPairsJson[networkId]
    .filter(
      r => (
        (
          assetDataA
            ? r.assetDataA.assetData === assetDataA
            : true
        )
        && (
          assetDataB
            ? r.assetDataB.assetData === assetDataB
            : true
        )
      ),
    )
    .slice(
      offset,
      offset + perPage,
    );
  return {
    network: networkId,
    total: assetPairsJson[networkId].length,
    page,
    perPage,
    records,
  };
}

function filterOrders({
  orders,
  makerAssetData,
  takerAssetData,
}) {
  return (
    orders
      .filter(
        r => (
          (
            makerAssetData
              ? r.order.makerAssetData === makerAssetData
              : true
          )
          && (
            takerAssetData
              ? r.order.takerAssetData === takerAssetData
              : true
          )
        ),
      )
  );
}

/*
 * The bid price represents the maximum price that a buyer is willing to pay for an asset
 * The ask price represents the minimum price that a seller is willing to receive
 * predefinedOrders is meant to facilitate tests
 */
export function mocksOrdersFactory({
  networkId,
  assetDataA,
  assetDataB,
  orders: predefinedOrders,
  qty = {
    bids: 100,
    asks: 100,
  },
} = {
  orders: null,
  qty: {
    bids: 100,
    asks: 100,
  },
}) {
  const assetPairs = getAssetPairs({
    networkId,
    assetDataA,
    assetDataB,
    // Just in case, to get all
    perPage: 10000,
  });
  function ordersIterator() {
    let {
      bids,
      asks,
    } = qty;
    return {
      next: (order = {}) => {
        const pair = assetPairs.records[Math.floor(Math.random() * (assetPairs.records.length - 1))];
        const {
          type: orderType,
          ...predefinedOrder
        } = order;
        const type = (
          orderType
          || (bids ? 'bid' : 'ask')
        );
        if (type === 'bid') {
          bids -= 1;
        } else {
          asks -= 1;
        }
        const randomOrder = {
          makerAddress: randomEthereumAddress(),
          takerAddress: NULL_ADDRESS,
          feeRecipientAddress: randomEthereumAddress(),
          senderAddress: randomEthereumAddress(),
          makerAssetAmount: generateRandomMakerAssetAmount().toString(),
          takerAssetAmount: generateRandomTakerAssetAmount().toString(),
          makerFee: '10000000000000000',
          takerFee: '20000000000000000',
          expirationTimeSeconds: '1532560590',
          salt: generatePseudoRandomSalt().toString(),
          makerAssetData: type === 'bid' ? pair.assetDataB.assetData : pair.assetDataA.assetData,
          takerAssetData: type === 'bid' ? pair.assetDataA.assetData : pair.assetDataB.assetData,
          exchangeAddress: randomEthereumAddress(),
          ...predefinedOrder,
        };
        /* It's a hash of the order but we will use at as signature in mock */
        const orderHashHex = orderHashUtils.getOrderHashHex(randomOrder);
        return {
          value: {
            type,
            order: {
              signature: orderHashHex,
              ...randomOrder,
            },
          },
          done: !bids && !asks,
        };
      },
    };
  }

  const ordersProvider = ordersIterator();
  const orders = (
    predefinedOrders
    || Array(qty.bids + qty.asks).fill()
  ).map(order => ordersProvider.next(order).value);
  const allBidsOrders = (
    orders
      .filter(
        order => (
          order.type === 'bid'
        ),
      )
      .map(o => ({
        order: o.order,
        metaData: {},
      }))
  );
  const allAsksOrders = (
    orders
      .filter(
        order => (
          order.type === 'ask'
        ),
      )
      .map(o => ({
        order: o.order,
        metaData: {},
      }))
  );

  return {
    getOrderBook({
      baseAssetData,
      quoteAssetData,
      page = 1,
      perPage = 100,
    } = {
      page: 1,
      perPage: 100,
    }) {
      if (!baseAssetData || !quoteAssetData) {
        throw Error('baseAssetData and quoteAssetData are required');
      }
      const sort = R.sortWith([
        (a, b) => {
          const aPrice = (
            parseInt(a.order.takerAssetAmount, 10) / parseInt(a.order.makerAssetAmount, 10)
          );
          const aTakerFeePrice = (
            parseInt(a.order.takerFee, 10) / parseInt(a.order.takerAssetAmount, 10)
          );
          const bPrice = (
            parseInt(b.order.takerAssetAmount, 10) / parseInt(b.order.makerAssetAmount, 10)
          );
          const bTakerFeePrice = (
            parseInt(b.order.takerFee, 10) / parseInt(b.order.takerAssetAmount, 10)
          );
          const aExpirationTimeSeconds = parseInt(a.expirationTimeSeconds, 10);
          const bExpirationTimeSeconds = parseInt(b.expirationTimeSeconds, 10);

          if (aTakerFeePrice === bTakerFeePrice) {
            return aExpirationTimeSeconds - bExpirationTimeSeconds;
          }
          if (aPrice === bPrice) {
            return aTakerFeePrice - bTakerFeePrice;
          }
          return aPrice - bPrice;
        },
      ]);
      const bidsOrders = sort(filterOrders({
        orders: allBidsOrders,
        makerAssetData: quoteAssetData,
        takerAssetData: baseAssetData,
      }));
      const asksOrders = sort(filterOrders({
        orders: allAsksOrders,
        makerAssetData: baseAssetData,
        takerAssetData: quoteAssetData,
      }));
      const offset = (page - 1) * perPage;
      return {
        bids: {
          total: bidsOrders.length,
          page,
          perPage,
          records: (
            bidsOrders
              .slice(
                offset,
                offset + perPage,
              )
          ),
        },
        asks: {
          total: asksOrders.length,
          page,
          perPage,
          records: (
            asksOrders
              .slice(
                offset,
                offset + perPage,
              )
          ),
        },
      };
    },

    getOrders({
      makerAssetData,
      takerAssetData,
      page = 1,
      perPage = 1000,
    } = {
      page: 1,
      perPage: 100,
    }) {
      const offset = (page - 1) * perPage;
      const sort = R.sortWith([
        (a, b) => {
          const aPrice = (
            parseInt(a.order.takerAssetAmount, 10) / parseInt(a.order.makerAssetAmount, 10)
          );
          const bPrice = (
            parseInt(b.order.takerAssetAmount, 10) / parseInt(b.order.makerAssetAmount, 10)
          );
          return bPrice - aPrice;
        },
      ]);
      return {
        total: orders.length,
        page,
        perPage,
        records:
          sort(filterOrders({
            makerAssetData,
            takerAssetData,
            orders: orders.map(o => ({
              order: o.order,
              metaData: {},
            })),
          })).slice(
            offset,
            offset + perPage,
          ),
      };
    },

    getTradingHistory({
      baseAssetData,
      quoteAssetData,
    }) {
      if (!baseAssetData || !quoteAssetData) {
        throw Error('baseAssetData and quoteAssetData are required');
      }
      const now = new Date();
      return {
        records: (
          orders.map((o, i) => ({
            order: {
              takerAddress: randomEthereumAddress(),
              ...o.order,
            },
            metaData: {
              completedAt: new Date(now - i * 60000).toString(),
            },
          }))
        ),
      };
    },
    getBars({
      from,
      to,
      resolution,
      firstDataRequest,
    }) {
      console.log('API CALL TO LOAD BARS');
      const res = resolutionsMap[resolution];
      const start = moment.unix(from).startOf(res.startOf);
      const end = moment.unix(to).startOf(res.startOf);
      console.log(start, end);

      if (!firstDataRequest && (start.isBefore('2016-03-24T01:14:00Z') || end.isAfter(new Date()))) {
        return {};
      }

      const now = new Date();
      const records = orders.map((o, i) => {
        const randomDate = new Date(now - i * 60000 * 60 * 4);
        return {
          order: o.order,
          metaData: {
            completedAt: randomDate,
          },
        };
      });

      const bars = records.reduce((acc, o) => {
        let period = moment(o.metaData.completedAt).utc();
        if (res.round) {
          period = nearestMinutes(res.round, period).unix();
        } else {
          period = period.startOf(res.startOf).unix();
        }
        const amount = o.order.takerAssetAmount;
        const price = new BigNumber(o.order.takerAssetAmount).div(o.order.makerAssetAmount);

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
      return bars;
    },
  };
}
