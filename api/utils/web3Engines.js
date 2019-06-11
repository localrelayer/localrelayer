import {
  RPCSubprovider,
  Web3ProviderEngine,
} from '0x.js';


Web3ProviderEngine.prototype.unshiftProvider = function unshiftProvider(source) {
  const self = this;
  self._providers.unshift(source);
  source.setEngine(this);
};

export const initWeb3ProviderEngine = (
  networkId,
  afterStart = true,
) => {
  const networksByIds = {
    1: {
      rpcUrl: 'https://eth-mainnet.alchemyapi.io/jsonrpc/XE7yAnUMrGLbVdtYgHqoiDU03IsjYU57',
    },
    42: {
      rpcUrl: 'https://kovan.infura.io/v3/240b30f52dcb42e0a051a4acdfe00d8e',
    },
    50: {
      rpcUrl: 'http://localhost:8545',
    },
  };
  const network = networksByIds[networkId];
  if (!network) {
    return null;
  }

  const engine = new Web3ProviderEngine();
  engine.addProvider(new RPCSubprovider(network.rpcUrl));
  if (afterStart) {
    engine.start();
  }
  return engine;
};
