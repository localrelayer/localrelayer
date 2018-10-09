import {
  ContractWrappers,
  RPCSubprovider,
  Web3ProviderEngine,
} from '0x.js';
import {
  performance,
} from 'perf_hooks';

import {
  redisClient,
} from '../../redis';
import {
  collectOrder,
  collectTradingInfo,
} from '../collect';
import {
  customSubscribe,
} from './customSubscribe';


const fillHandler = networkId => async (err, event) => {
  const t0 = performance.now();
  /* measure how long this function works */
  try {
    console.log('=============================================');
    if (err) {
      throw err;
    }
    console.log('Network ID', networkId);
    console.log('New 0x Fill Event');
    console.log(event.log.args);
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
    const { tradingInfoRedisKey } = await collectTradingInfo(order);

    redisClient.publish('tradingInfo', tradingInfoRedisKey);
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
  const t1 = performance.now();
  console.log(`Fill handler perf measure - ${t1 - t0} ml`);
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
  // customSubscribe();
  networks.forEach((network) => {
    const {
      engine,
      networkId,
    } = initProvider(network);
    const contractWrapper = new ContractWrappers(
      engine,
      {
        networkId,
      },
    );
    contractWrapper.exchange.subscribe(
      'Fill',
      {},
      fillHandler(networkId),
    );
  });
}
