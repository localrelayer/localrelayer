import { ZeroEx } from '0x.js';

export const loadWeb3 = () =>
  new Promise((resolve) => {
    // Wait for loading completion to avoid race conditions with web3 injection timing.
    window.addEventListener('load', () => {
      // Checking if Web3 has been injected by the browser (Mist/MetaMask)
      if (typeof web3 !== 'undefined') {
        // Use Mist/MetaMask's provider.
        const zeroEx = new ZeroEx(window.web3.currentProvider, {
          networkId: 50,
        });
        const web3 = new Web3(window.web3.currentProvider);
        window.web3 = web3;
        window.zeroEx = zeroEx;
        console.warn('Injected web3 detected.');
        resolve(zeroEx);
      } else {
        resolve(null);
        console.warn('No web3 instance injected, please use Metamask');
      }
    });
  });

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
