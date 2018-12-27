import '../../aliases';
import uuidv4 from 'uuid/v4';
import WebSocket from 'ws';
import {
  assetDataUtils,
} from '0x.js';
import axios from 'axios';

import {
  AssetPair,
  Order,
} from 'db';
import {
  redisClient,
} from 'redisClient';
import {
  constructOrderRecord,
} from 'utils';


function delay(ms) {
  return new Promise((r) => {
    setTimeout(
      r,
      ms,
    );
  });
}

export async function runSyncronizer(config) {
  function configureOrder({
    order,
    metaData,
  }) {
    const decMakerAssetData = (
      assetDataUtils.decodeERC20AssetData(order.makerAssetData)
    );
    const decTakerAssetData = (
      assetDataUtils.decodeERC20AssetData(order.takerAssetData)
    );
    return ({
      ...order,
      ...metaData,
      makerAssetAddress: decMakerAssetData.tokenAddress,
      makerAssetProxyId: decMakerAssetData.assetProxyId,
      takerAssetAddress: decTakerAssetData.tokenAddress,
      takerAssetProxyId: decTakerAssetData.assetProxyId,
      isValid: true,
      isShadowed: false,
      remainingFillableMakerAssetAmount: order.makerAssetAmount,
      remainingFillableTakerAssetAmount: order.takerAssetAmount,
      filledTakerAssetAmount: '0',
      createdAt: new Date().toISOString(),
      networkId: config.NETWORK_ID,
      sourceRelayer: config.RELAYER_NAME,
    });
  }

  async function fetchOrderBook({
    assetDataA,
    assetDataB,
    networkId,
    page = 1,
    orders = [],
  }) {
    console.log('fetchOrderBook');
    const perPage = 100;
    try {
      const response = await axios({
        method: 'get',
        baseURL: config.API_URL,
        url: '/orderbook',
        params: {
          baseAssetData: assetDataA.assetData,
          quoteAssetData: assetDataB.assetData,
          networkId,
          page,
          perPage,
        },
      });
      if (
        response.data.asks.total > (page * perPage)
        || response.data.bids.total > (page * perPage)
      ) {
        const addiTionalPages = await fetchOrderBook({
          assetDataA,
          assetDataB,
          networkId,
          page: page + 1,
          orders: [
            ...orders,
            ...response.data.asks.records,
            ...response.data.bids.records,
          ],
        });
        return addiTionalPages;
      }
      return [
        ...orders,
        ...response.data.asks.records,
        ...response.data.bids.records,
      ];
    } catch (err) {
      console.log(err?.response?.status);
      if (err?.response?.status === 429) {
        await delay(10000);
        const retryResponse = await fetchOrderBook({
          assetDataA,
          assetDataB,
          networkId,
          orders: [],
          page: 1,
        });
        return retryResponse;
      }
      return orders;
    }
  }

  async function saveOrders(orders) {
    console.log('saveOrders');
    const existOrders = await Order.find({
      orderHash: {
        $in: (
          orders.map(({ metaData }) => (
            metaData.orderHash
          ))
        ),
      },
    });
    const existOrdersHashes = existOrders.reduce(
      (acc, order) => ({
        ...acc,
        [order.orderHash]: true,
      }), {},
    );
    const newOrders = orders.filter(
      ({ metaData }) => (
        !existOrdersHashes[metaData.orderHash]
      ),
    ).map(configureOrder);
    try {
      await Order.collection.insertMany([
        ...newOrders,
      ]);
      newOrders.forEach(
        (order) => {
          redisClient.publish(
            'orderWatcher',
            JSON.stringify(constructOrderRecord(order)),
          );
        },
      );
    } catch (err) {
      console.log(err);
    }
  }

  async function fetchAllPairsOrderBook(assetPairs) {
    console.log('fetchAllPairsOrderBook');
    const ordersArr = await Promise.all(
      assetPairs.map(
        pair => (
          fetchOrderBook(pair)
        ),
      ),
    );
    await saveOrders(
      [].concat(...ordersArr),
    );
    console.log('Orders has been saved!');
  }

  const assetPairs = await AssetPair.find({
    networkId: config.NETWORK_ID,
  });
  const assetPairsHash = assetPairs.reduce(
    (acc, pair) => ({
      ...acc,
      [`${pair.assetDataA.assetData}_${pair.assetDataB.assetData}`]: true,
      [`${pair.assetDataB.assetData}_${pair.assetDataA.assetData}`]: true,
    }),
    {},
  );

  const ws = new WebSocket(config.WEBSOCKET_URL);
  ws.on('open', () => {
    console.log('WS open');
    ws.send(JSON.stringify({
      type: 'subscribe',
      channel: 'orders',
      requestId: uuidv4(),
      payload: {},
    }));
  });

  /* TODO: REMOVE - filter and save + send to the orderWatcher and socket server */
  ws.on('message', (message) => {
    const data = JSON.parse(message);
    if (
      data.type !== 'subscribe'
    ) {
      const newOrders = data.payload.filter(
        ({
          order,
          metaData,
        }) => (
          metaData.action === 'NEW'
          && (
            assetPairsHash[`${order.makerAssetData}_${order.takerAssetData}`]
          )
        ),
      );
      if (newOrders.length) {
        saveOrders(newOrders);
      }
    }
  });
  await fetchAllPairsOrderBook(assetPairs);
}
