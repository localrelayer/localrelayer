import {
  generatePseudoRandomSalt,
} from '@0xproject/order-utils';
import * as R from 'ramda';
import assetPairsJson from './assetPairs.json';

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
  const records = assetPairsJson
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
    total: records.length,
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
        const pair = assetPairs.records[Math.floor(Math.random() * assetPairs.records.length)];
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
        return {
          value: {
            type,
            order: {
              makerAddress: randomEthereumAddress(),
              takerAddress: NULL_ADDRESS,
              feeRecipientAddress: randomEthereumAddress(),
              senderAddress: randomEthereumAddress(),
              makerAssetAmount: '10000000000000000',
              takerAssetAmount: '20000000000000000',
              makerFee: '10000000000000000',
              takerFee: '20000000000000000',
              expirationTimeSeconds: '1532560590',
              salt: generatePseudoRandomSalt().toString(),
              makerAssetData: type === 'bid' ? pair.assetDataB.assetData : pair.assetDataA.assetData,
              takerAssetData: type === 'bid' ? pair.assetDataA.assetData : pair.assetDataB.assetData,
              exchangeAddress: randomEthereumAddress(),
              ...predefinedOrder,
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
            parseInt(a.order.takerAssetAmount, 10)
            / parseInt(a.order.makerAssetAmount, 10)
          );
          const aTakerFeePrice = (
            parseInt(a.order.takerFee, 10)
            / parseInt(a.order.takerAssetAmount, 10)
          );
          const bPrice = (
            parseInt(b.order.takerAssetAmount, 10)
            / parseInt(b.order.makerAssetAmount, 10)
          );
          const bTakerFeePrice = (
            parseInt(b.order.takerFee, 10)
            / parseInt(b.order.takerAssetAmount, 10)
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
            parseInt(a.order.takerAssetAmount, 10)
            / parseInt(a.order.makerAssetAmount, 10)
          );
          const bPrice = (
            parseInt(b.order.takerAssetAmount, 10)
            / parseInt(b.order.makerAssetAmount, 10)
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
  };
}
