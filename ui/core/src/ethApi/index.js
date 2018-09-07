/**
 * This factory intends to hide details of implementation JSON RPC Ethereum api.
 */
function ethApiFactory() {
  let web3 = null;
  return ({
    setWeb3(web3Instance) {
      web3 = web3Instance;
    },

    getWeb3() {
      return web3;
    },
  });
}

const ethApi = ethApiFactory();

export default ethApi;
