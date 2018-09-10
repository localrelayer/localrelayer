import {
  ContractWrappers,
  RPCSubprovider,
  Web3ProviderEngine,
} from '0x.js';

import socket from '../socket-emitter';
import {
  collectOrder,
  collectTradingInfo,
} from '../collect';


const fillHandler = networkId => async (err, event) => {
  try {
    console.log('=============================================');
    if (err) {
      throw err;
    }
    console.log('Network ID', networkId);
    console.log('New 0x Fill Event');
    // console.log(event.log.args);
    const {
      makerAssetData,
      takerAssetData,
      makerAssetFilledAmount,
      takerAssetFilledAmount,
      makerAddress,
      takerAddress,
      feeRecipientAddress,
      senderAddress,
      makerFeePaid,
      takerFeePaid,
      orderHash,
    } = event.log.args;

    const orderFields = {
      makerAddress,
      takerAddress,
      feeRecipientAddress,
      senderAddress,
      makerAssetAmount: makerAssetFilledAmount,
      takerAssetAmount: takerAssetFilledAmount,
      makerFee: makerFeePaid,
      takerFee: takerFeePaid,
      makerAssetData,
      takerAssetData,
      completedAt: new Date(),
      orderHash,
      networkId,
    };

    const order = await collectOrder(orderFields);
    const {
      pair,
      tradingInfo,
    } = await collectTradingInfo(order);

    socket.io.to(pair).emit('message', {
      tradingInfo: [{
        tradingInfo,
        pair,
      }],
      orders: [order],
    });
    console.log('=============================================');
  } catch (error) {
    if (
      error.name === 'MongoError'
      && error.code === 11000
    ) {
      console.log('Duplicate key');
    } else {
      console.log(error);
    }
  }
};


const initProvider = (networkName) => {
  const networkIds = {
    main: {
      id: 1,
      rpcUrl: 'https://mainnet.infura.io/v3/240b30f52dcb42e0a051a4acdfe00d8e',
    },
    kovan: {
      id: 42,
      rpcUrl: 'https://kovan.infura.io/v3/240b30f52dcb42e0a051a4acdfe00d8e',
    },
    test: {
      id: 50,
      rpcUrl: 'http://localhost:8545',
    },
  };
  const network = networkIds[networkName];

  const engine = new Web3ProviderEngine();
  engine.addProvider(new RPCSubprovider(network.rpcUrl));
  engine.start();
  return {
    engine,
    networkId: network.id,
  };
};

export function subscribeExchangeEvents(networks) {
  networks.forEach((network) => {
    const {
      engine,
      networkId,
    } = initProvider(network);
    const contractWrapper = new ContractWrappers(
      engine, { networkId },
    );
    contractWrapper.exchange.subscribe(
      'Fill',
      {},
      fillHandler(networkId),
    );
  });
}
