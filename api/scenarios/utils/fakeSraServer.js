import {
  providerEngine,
} from './providerEngine';

import * as constants from './constants';
import BigNumber from '../../BigNumber';

const zeroEx = require('0x.js');
const bodyParser = require('body-parser');
const express = require('express');

const HTTP_OK_STATUS = 200;
const HTTP_BAD_REQUEST_STATUS = 400;
const HTTP_PORT = 3000;
// Global state
const orders = [];
const ordersByHash = {};

function renderOrderbookResponse(baseAssetData, quoteAssetData) {
  const bidOrders = orders.filter(
    order => order.takerAssetData === baseAssetData && order.makerAssetData === quoteAssetData,
  );
  const askOrders = orders.filter(
    order => order.takerAssetData === quoteAssetData && order.makerAssetData === baseAssetData,
  );
  const bidApiOrders = bidOrders.map(order => ({ metaData: {}, order }));
  const askApiOrders = askOrders.map(order => ({ metaData: {}, order }));
  return {
    bids: {
      records: bidApiOrders,
      page: 1,
      perPage: 100,
      total: bidOrders.length,
    },
    asks: {
      records: askApiOrders,
      page: 1,
      perPage: 100,
      total: askOrders.length,
    },
  };
}
// As the orders come in as JSON they need to be turned into the correct types such as BigNumber
function parseHTTPOrder(signedOrder) {
  signedOrder.salt = BigNumber(signedOrder.salt);
  signedOrder.makerAssetAmount = BigNumber(signedOrder.makerAssetAmount);
  signedOrder.takerAssetAmount = BigNumber(signedOrder.takerAssetAmount);
  signedOrder.makerFee = BigNumber(signedOrder.makerFee);
  signedOrder.takerFee = BigNumber(signedOrder.takerFee);
  signedOrder.expirationTimeSeconds = BigNumber(signedOrder.expirationTimeSeconds);
  return signedOrder;
}
function removeOrder(orderHash) {
  const order = ordersByHash[orderHash];
  const orderIndex = orders.indexOf(order);
  if (orderIndex > -1) {
    orders.splice(orderIndex, 1);
  }
}


// We subscribe to the Exchange Events to remove any filled or cancelled orders
const contractWrappers = new zeroEx.ContractWrappers(
  providerEngine,
  {
    networkId: constants.GANACHE_NETWORK_ID,
  },
);
contractWrappers.exchange.subscribe(zeroEx.ExchangeEvents.Fill, {}, (err, decodedLogEvent) => {
  if (err) {
    console.log('error:', err);
  } else if (decodedLogEvent) {
    const fillLog = decodedLogEvent.log;
    const { orderHash } = fillLog.args;
    console.log(`Order filled ${fillLog.args.orderHash}`);
    removeOrder(orderHash);
  }
});
// Listen for Cancel Exchange Events and remove any orders
contractWrappers.exchange.subscribe(zeroEx.ExchangeEvents.Cancel, {}, (err, decodedLogEvent) => {
  if (err) {
    console.log('error:', err);
  } else if (decodedLogEvent) {
    const fillLog = decodedLogEvent.log;
    const { orderHash } = fillLog.args;
    console.log(`Order cancelled ${fillLog.args.orderHash}`);
    removeOrder(orderHash);
  }
});
// HTTP Server
const app = express();
app.use(bodyParser.json());
/**
 * GET Orderbook endpoint retrieves the orderbook for a given asset pair.
 * http://sra-spec.s3-website-us-east-1.amazonaws.com/#operation/getOrderbook
 */
app.get('/v2/orderbook', (req, res) => {
  console.log('HTTP: GET orderbook');
  const { baseAssetData } = req.query;
  const { quoteAssetData } = req.query;
  const networkIdRaw = req.query.networkId;
  // tslint:disable-next-line:custom-no-magic-numbers
  const networkId = parseInt(networkIdRaw, 10);
  if (networkId !== constants.GANACHE_NETWORK_ID) {
    console.log(`Incorrect Network ID: ${networkId}`);
    res.status(HTTP_BAD_REQUEST_STATUS).send({});
  } else {
    const orderbookResponse = renderOrderbookResponse(baseAssetData, quoteAssetData);
    res.status(HTTP_OK_STATUS).send(orderbookResponse);
  }
});
/**
 * POST Order config endpoint retrives the values for order fields that the relayer requires.
 * http://sra-spec.s3-website-us-east-1.amazonaws.com/#operation/getOrderConfig
 */
app.post('/v2/order_config', (req, res) => {
  console.log('HTTP: POST order config');
  const networkIdRaw = req.query.networkId;
  // tslint:disable-next-line:custom-no-magic-numbers
  const networkId = parseInt(networkIdRaw, 10);
  if (networkId !== constants.GANACHE_NETWORK_ID) {
    console.log(`Incorrect Network ID: ${networkId}`);
    res.status(HTTP_BAD_REQUEST_STATUS).send({});
  } else {
    const orderConfigResponse = {
      senderAddress: constants.NULL_ADDRESS,
      feeRecipientAddress: constants.NULL_ADDRESS,
      makerFee: constants.ZERO,
      takerFee: '1000',
    };
    res.status(HTTP_OK_STATUS).send(orderConfigResponse);
  }
});
/**
 * POST Order endpoint submits an order to the Relayer.
 * http://sra-spec.s3-website-us-east-1.amazonaws.com/#operation/postOrder
 */
app.post('/v2/order', (req, res) => {
  console.log('HTTP: POST order');
  const networkIdRaw = req.query.networkId;
  const networkId = parseInt(networkIdRaw, 10);
  if (networkId !== constants.GANACHE_NETWORK_ID) {
    console.log(`Incorrect Network ID: ${networkId}`);
    res.status(HTTP_BAD_REQUEST_STATUS).send({});
  } else {
    const signedOrder = parseHTTPOrder(req.body);
    const orderHash = zeroEx.orderHashUtils.getOrderHashHex(signedOrder);
    ordersByHash[orderHash] = signedOrder;
    orders.push(signedOrder);
    res.status(HTTP_OK_STATUS).send({});
  }
});
app.listen(HTTP_PORT, () => console.log('Standard relayer API (HTTP) listening on port 3000!'));
