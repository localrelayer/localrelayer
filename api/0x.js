const { ZeroEx } = require('0x.js');
const WebSocketClient = require('websocket').client;
const BigNumber = require('bignumber.js');
const Web3 = require('web3');
const moment = require('moment');
const fetch = require('node-fetch');
const TokenJSON = require('./Token.js');
const { pgBookshelf } = require('./src/db');
const { tokens, orders } = require('./src/models');

const abi = [
  {
    constant: true,
    inputs: [],
    name: 'symbol',
    outputs: [
      {
        name: '',
        type: 'bytes32'
      }
    ],
    payable: false,
    type: 'function'
  },
  {
    constant: true,
    inputs: [],
    name: 'name',
    outputs: [
      {
        name: '',
        type: 'bytes32'
      }
    ],
    payable: false,
    stateMutability: 'view',
    type: 'function',
  },
];

const client = new WebSocketClient();

const ordersCollection = pgBookshelf.Collection.extend({
  model: orders
});

export const providerUrl = process.env.NODE_ENV === 'production' ? 'http://13.57.48.254:8545' : 'http://localhost:8545';
export const provider = new Web3.providers.HttpProvider(providerUrl);
export const web3 = new Web3(provider);
export const zeroEx = new ZeroEx(provider, {
  // 42 is Kovan, 50 is local testnet
  // networkId: process.env.NODE_ENV === 'production' ? 1 : 50
  networkId: 1,
});

const createToken = async (tokenAddress) => {
  const deployed = new web3.eth.Contract(TokenJSON, tokenAddress);
  let name;
  let symbol;
  try {
    name = await deployed.methods.name().call();
    symbol = await deployed.methods.symbol().call();
  } catch (e) {
    const fixedABI = new web3.eth.Contract(abi, tokenAddress);
    name = await fixedABI.methods.name().call();
    symbol = await fixedABI.methods.symbol().call();
  }

  const decimals = await deployed.methods.decimals().call();


  try {
    await tokens.forge({
      address: tokenAddress.toLowerCase(),
      name,
      symbol,
      decimals,
      is_listed: true,
    })
      .save(null, { method: 'insert' });
  } catch (e) {
    console.log(e.message);
  }
  console.log('Created token', name);
};

const generateTokenMappingRadarRelay = (array) => {
  const filtered = array.filter(i => !i.deprecated);
  const pairs = filtered.filter(i => i.quote);
  let requestCounter = 1;

  const mapping = filtered.reduce((result, token) => {
    pairs.forEach((pair) => {
      if (token.address !== pair.address) {
        result[requestCounter] = {
          baseTokenAddress: pair.address,
          quoteTokenAddress: token.address,
        };
        requestCounter++;
      }
    });
    return result;
  }, {});
  return mapping;
};

client.on('connect', async (connection) => {
  console.log('Connected to Server...');
  let mapping = {};
  try {
    // allTokens = await tokens.fetchAll();
    const resp = await fetch('https://api.radarrelay.com/v0/tokens');
    const radarrelayTokens = await resp.json();
    mapping = generateTokenMappingRadarRelay(radarrelayTokens);
  } catch (e) {
    console.log(e.message);
  }

  const processOrders = async (message) => {
    const data = JSON.parse(message.utf8Data);
    if (data.payload) {
      const buyOrders = data.payload.asks || [];
      const sellOrders = data.payload.bids || [];

      const { quoteTokenAddress, baseTokenAddress } = mapping[data.requestId];
      try {
        const formattedBuyOrders = await Promise.all(
          buyOrders.map(async zrxOrder =>
            convertZRXorderToInstexOrder({
              zrxOrder,
              type: 'buy',
              quoteTokenAddress,
              baseTokenAddress
            })
          )
        );

        const formattedSellOrders = await Promise.all(
          sellOrders.map(async zrxOrder =>
            convertZRXorderToInstexOrder({
              zrxOrder,
              type: 'sell',
              quoteTokenAddress,
              baseTokenAddress
            })
          )
        );

        await ordersCollection
          .forge([
            ...formattedBuyOrders.filter(o => o),
            ...formattedSellOrders.filter(o => o),
          ])
          .invokeThen('save');

        console.log('DONE');
      } catch (e) {
        console.log(e.message);
      }
    }
  };

  connection.on('message', async (message) => {
    if (message.type === 'utf8') {
      await processOrders(message);
    }
  });

  function send(message) {
    try {
      if (connection.connected) {
        connection.sendUTF(message);
      }
    } catch (e) {
      console.log(e.message);
    }
  }

  try {
    // console.log(mapping);
    Object.keys(mapping).forEach((requestId) => {
      send(`{
      "type": "subscribe",
      "channel": "orderbook",
      "requestId": ${parseInt(requestId, 10)},
      "payload": {
          "baseTokenAddress": "${mapping[requestId].baseTokenAddress}",
          "quoteTokenAddress": "${mapping[requestId].quoteTokenAddress}",
          "snapshot": true,
          "limit": 1000
      }
    }`);
    });
  } catch (e) {
    console.log(e.message);
  }
});

const convertZRXorderToInstexOrder = async ({ zrxOrder, type, quoteTokenAddress, baseTokenAddress }) => {
  // source
  const order_hash = ZeroEx.getOrderHashHex(zrxOrder);

  let token = await tokens.query({ where: { address: quoteTokenAddress.toLowerCase() } }).fetch();
  let pair = await tokens.query({ where: { address: baseTokenAddress.toLowerCase() } }).fetch();

  const existedOrder = await orders.query({ where: { order_hash } }).fetch();

  if (existedOrder) {
    console.log('Order already exists in the DB');
    return;
  }

  if (!token) {
    console.log('NO TOKEN', quoteTokenAddress);
    token = await createToken(quoteTokenAddress);
  }

  if (!pair) {
    console.log('NO PAIR', baseTokenAddress);
    pair = await createToken(baseTokenAddress);
  }

  const tokenDecimals = token.attributes.decimals;
  const pairDecimals = pair.attributes.decimals;

  const amount =
    type === 'buy'
      ? ZeroEx.toUnitAmount(BigNumber(zrxOrder.takerTokenAmount), tokenDecimals)
      : ZeroEx.toUnitAmount(BigNumber(zrxOrder.makerTokenAmount), tokenDecimals);

  const total =
    type === 'buy'
      ? ZeroEx.toUnitAmount(BigNumber(zrxOrder.makerTokenAmount), pairDecimals)
      : ZeroEx.toUnitAmount(BigNumber(zrxOrder.takerTokenAmount), pairDecimals);

  // console.log('MAKER AND TAKER AMOUNTS');
  // console.log(zrxOrder.makerTokenAmount, zrxOrder.takerTokenAmount);
  // console.log('AMOUNT AND TOTAL');
  // console.log(amount.toNumber(), total.toNumber());

  const price = total.div(amount).toFixed(12);

  return {
    token_address: quoteTokenAddress,
    pair_address: baseTokenAddress,
    maker_address: zrxOrder.maker,
    order_hash,
    type,
    price,
    amount: amount.toFixed(12),
    total: total.toFixed(12),
    status: 'new',
    created_at: moment().toISOString(),
    zrxOrder,
    expires_at: moment().add(1, 'year'),
  };
};

client.connect('wss://api.radarrelay.com/0x/v0/ws');
