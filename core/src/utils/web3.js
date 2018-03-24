import { ZeroEx } from '0x.js';

const Web3 = require('web3');

let web3;

export const loadZeroEx = () => new Promise((resolve) => {
  // Wait for loading completion to avoid race conditions with web3 injection timing.
  window.addEventListener('load', async () => {
    // Checking if Web3 has been injected by the browser (Mist/MetaMask)
    if (typeof window.web3 !== 'undefined') {
      let networkId;
      web3 = new Web3(window.web3.currentProvider);
      try {
        networkId = +(await web3.eth.net.getId());
      } catch (e) {
        console.warn(e);
        console.warn('Couldn\'t get a network, using testnet');
        networkId = 50;
      }
      const zeroEx = initializeZeroEx(networkId);
      console.warn('Injected web3 detected.');
      resolve(zeroEx);
    } else {
      resolve(null);
      window.web3 = undefined;
      console.warn('No web3 instance injected, please use Metamask');
    }
  });
});

export const initializeZeroEx = (networkId = 50) => {
  // Use Mist/MetaMask's provider.
  const zeroEx = new ZeroEx(window.web3.currentProvider, {
    networkId,
  });
  window.web3 = web3;
  window.zeroEx = zeroEx;

  return zeroEx;
};


export const getNetworkById = (id: number) => {
  const networks = {
    '1': 'Mainnet',
    '2': 'Morden (deprecated)',
    '3': 'Ropsten Testnet',
    '4': 'Rinkbery Testnet',
    '42': 'Kovan Testnet',
    '50': 'Local Testnet',
  };
  return networks[id] || 'Unknown network.';
};

export const connectionStatuses = {
  NOT_CONNECTED: 'Not connected to Ethereum',
  CONNECTED: 'Connected',
  LOCKED: 'Locked',
};

export const NODE_ADDRESS = '0x5409ed021d9299bf6814279a6a1411a7e866a631';
export const SMALLEST_AMOUNT = 0.005;
// Around 1$ for now
export const TRANSACTION_FEE = 0.001;
// Percentage fee (our fee)
export const EXCHANGE_FEE = 0.0025;
