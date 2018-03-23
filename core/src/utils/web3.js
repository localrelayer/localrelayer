import { ZeroEx } from '0x.js';
import {
  promisify,
} from 'es6-promisify';

const Web3 = require('web3');

export const loadZeroEx = () => new Promise((resolve) => {
  // Wait for loading completion to avoid race conditions with web3 injection timing.
  window.addEventListener('load', async () => {
    const { web3 } = window;
    // Checking if Web3 has been injected by the browser (Mist/MetaMask)
    if (typeof web3 !== 'undefined') {
      let networkId = 50;
      console.log('that is', web3);
      try {
        networkId = +(await promisify(web3.version.getNetwork()));
      } catch (e) {
        console.warn('Couldn\'t get a network, using testnet');
      }
      console.log(web3);
      const zeroEx = initializeZeroEx(networkId);
      console.warn('Injected web3 detected.');
      resolve(zeroEx);
    } else {
      resolve(null);
      console.warn('No web3 instance injected, please use Metamask');
    }
  });
});

export const initializeZeroEx = (networkId = 50) => {
  // Use Mist/MetaMask's provider.
  const zeroEx = new ZeroEx(window.web3.currentProvider, {
    networkId,
  });
  const web3 = new Web3(window.web3.currentProvider);
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
