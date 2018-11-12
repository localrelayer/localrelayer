import {
  RPCSubprovider,
  Web3ProviderEngine,
} from '0x.js';

export const initProvider = (networkId) => {
  const networksByIds = {
    1: {
      rpcUrl: 'https://mainnet.infura.io/v3/240b30f52dcb42e0a051a4acdfe00d8e',
    },
    42: {
      rpcUrl: 'https://kovan.infura.io/v3/240b30f52dcb42e0a051a4acdfe00d8e',
    },
    50: {
      rpcUrl: 'http://localhost:8545',
    },
  };
  const network = networksByIds[+networkId];

  const engine = new Web3ProviderEngine();
  engine.addProvider(new RPCSubprovider(network.rpcUrl));
  engine.start();
  return {
    engine,
    networkId,
  };
};
