import {
  ContractWrappers,
} from '@0xproject/contract-wrappers';

/**
 * This factory intends to hide details of implementation JSON RPC Ethereum api.
 */
function ethApiFactory() {
  let web3 = null;
  let contractWrappers = null;

  return ({
    setWeb3(web3Instance) {
      web3 = web3Instance;
    },

    getWeb3() {
      return web3;
    },

    setWrappers(networkId) {
      contractWrappers = new ContractWrappers(
        web3.currentProvider,
        {
          networkId,
        },
      );
    },

    getWrappers(networkId) {
      if (contractWrappers) {
        return contractWrappers;
      }
      this.setWrappers(networkId);
      return contractWrappers;
    },
  });
}

const ethApi = ethApiFactory();

export default ethApi;
