import {
  BigNumber,
} from '0x.js';
import {
  ExchangeContractErrs,
} from '@0x/types';
import {
  generatePseudoRandomSalt,
} from '@0x/order-utils';
import {
  Web3Wrapper,
} from '@0x/web3-wrapper';
import * as R from 'ramda';
import assetPairsMainJson from './assetPairs.main.json';
import assetPairsKovanJson from './assetPairs.kovan.json';
import assetPairsTestJson from './assetPairs.test.json';


export const assetPairsJson = {
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
        const pair = assetPairs.records[
          Math.floor(Math.random() * (assetPairs.records.length - 1))
        ];
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
        return {
          value: {
            type,
            order: {
              signature: generatePseudoRandomSalt().toString(),
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
        metaData: {
          isValid: true,
        },
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
        metaData: {
          isValid: true,
        },
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
      perPage = 100,
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
              isValid: false,
              isShadowed: false,
              remainingFillableMakerAssetAmount: '0',
              remainingFillableTakerAssetAmount: '0',
              networkId,
              createdAt: new Date(now - (i * 5) * 60000).toString(),
              completedAt: new Date(now - i * 60000).toString(),
              lastFilledAt: new Date(now - i * 60000).toString(),
              filledTakerAssetAmount: o.order.takerAssetAmount,
              error: ExchangeContractErrs.OrderRemainingFillAmountZero,
            },
          }))
        ),
      };
    },
    getTradingInfo({
      baseAssetData,
      quoteAssetData,
    }) {
      const pairId = `${baseAssetData}_${quoteAssetData}`;
      const bidOrders = allBidsOrders.map(orderObject => orderObject.order);
      const calculatedTradingInfo = bidOrders.reduce((acc, order) => {
        const lastPrice = new BigNumber(order.makerAssetAmount)
          .div(order.takerAssetAmount).toFixed(8);
        const minPrice = BigNumber.min(lastPrice, acc.minPrice).toNumber() || lastPrice;
        const maxPrice = BigNumber.max(lastPrice, acc.maxPrice).toNumber() || lastPrice;

        const assetAVolume = acc.assetAVolume
          ? new BigNumber(order.makerAssetAmount).plus(acc.assetAVolume)
          : order.makerAssetAmount;

        const assetBVolume = acc.assetBVolume
          ? new BigNumber(order.takerAssetAmount).plus(acc.assetBVolume)
          : order.takerAssetAmount;

        const change24 = acc.firstOrderPrice
          ? new BigNumber(lastPrice)
            .div(acc.firstOrderPrice)
            .minus(1)
            .times(100)
            .toFixed(2)
          : '0.00';
        return {
          assetAVolume,
          assetBVolume,
          change24,
          lastPrice,
          maxPrice,
          minPrice,
        };
      }, {
        minPrice: 0,
        maxPrice: 0,
        assetAVolume: 0,
        assetBVolume: 0,
        firstOrderPrice: 0,
      });
      const tradingInfo = {
        lastPrice: new BigNumber(calculatedTradingInfo.lastPrice).toFixed(8),
        minPrice: new BigNumber(calculatedTradingInfo.minPrice).toFixed(8),
        maxPrice: new BigNumber(calculatedTradingInfo.maxPrice).toFixed(8),
        assetAVolume: new BigNumber(calculatedTradingInfo.assetAVolume).toFixed(8),
        assetBVolume: new BigNumber(calculatedTradingInfo.assetBVolume).toFixed(8),
        change24: calculatedTradingInfo.change24,
        firstOrderPrice: new BigNumber(calculatedTradingInfo.firstOrderPrice
          || calculatedTradingInfo.lastPrice).toFixed(8),
      };
      return {
        records: {
          [pairId]: {
            ...tradingInfo,
            id: pairId,
            assetDataA: baseAssetData,
            assetDataB: quoteAssetData,
            networkId,
          },
        },
      };
    },

    getBars({
      resolution,
      baseAssetData,
      from,
    }) {
      const nearestMinutes = (period, interval) => {
        const date = new Date(period);
        const roundedMinutes = Math.round(
          date.getMinutes() / interval,
        ) * interval;
        date.setHours(date.getHours(), roundedMinutes, 0, 0);
        return date;
      };
      const startOf = (period, unit) => {
        const date = new Date(period);
        switch (unit) {
          case 'minute':
            date.setMinutes(date.getMinutes(), 0, 0);
            break;
          case 'hour':
            date.setHours(date.getHours(), 0, 0, 0);
            break;
          case 'day':
            date.setHours(0, 0, 0, 0);
            break;
          default: break;
        }
        return date;
      };
      const generatePastUTCDate = () => {
        const randNum = num => Math.floor((Math.random() * num));
        const date = new Date();
        const year = date.getFullYear();
        const month = date.getMonth() + 1;
        const yesterday = date.getDate() - 1;
        return `${year}-${month}-${yesterday}T${randNum(2)}${randNum(9)}:${randNum(6)}0:00.000Z`;
      };
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
      const allOrders = allBidsOrders.map(orderObject => orderObject.order)
        .concat(allAsksOrders.map(orderObject => orderObject.order));
      const res = resolutionsMap[resolution];
      const oldestOrderMock = Math.floor(new Date().setDate(new Date().getDate() - 2) / 1000);
      // don't try to retrieve orders older than the oldest one
      const feed = from < oldestOrderMock ? {}
        : allOrders.reduce((acc, order) => {
          let period = generatePastUTCDate();
          if (res.round) {
            period = Math.floor(+nearestMinutes(period, res.round) / 1000);
          } else {
            period = Math.floor(+startOf(period, res.startOf) / 1000);
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
      return {
        items: feed,
      };
    },
  };
}
