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
      // rpcUrl: 'http://api.instex.io:8545',
      rpcUrl: 'https://eth-kovan.alchemyapi.io/jsonrpc/XE7yAnUMrGLbVdtYgHqoiDU03IsjYU57',
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
