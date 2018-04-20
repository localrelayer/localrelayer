import { ZeroEx } from '0x.js';
import Web3ProviderEngine from 'web3-provider-engine';
import {
  ledgerEthereumBrowserClientFactoryAsync as ledgerEthereumClientFactoryAsync,
  LedgerSubprovider,
} from '@0xproject/subproviders';

const RpcSubprovider = require('web3-provider-engine/subproviders/rpc.js');

const Web3 = require('web3');

export const startMetamask = () =>
  new Promise(() => {
    window.addEventListener('load', async () => {
      initMetamask();
    });
  });

export const initMetamask = async () => {
  if (typeof window.web3 !== 'undefined') {
    const web3 = new Web3(window.web3.currentProvider);
    let networkId;
    try {
      networkId = +await web3.eth.net.getId();
    } catch (e) {
      console.warn(e);
      console.warn("Couldn't get a network, using mainnet");
      networkId = 1;
    }
    const zeroEx = new ZeroEx(window.web3.currentProvider, {
      networkId,
    });
    window.zeroEx = zeroEx;
    window.web3Instance = web3;
  }
};

export const initLedger = async () => {
  const providerEngine = new Web3ProviderEngine();
  const networkId = 1;

  const ledgerSubprovider = new LedgerSubprovider({
    networkId,
    ledgerEthereumClientFactoryAsync,
  });

  providerEngine.addProvider(ledgerSubprovider);
  providerEngine.addProvider(
    new RpcSubprovider({
      rpcUrl: 'https://mainnet.infura.io/metamask',
    }),
  );
  providerEngine.start();

  // network connectivity error
  providerEngine.on('error', (err) => {
    // report connectivity errors
    console.error(err.stack);
  });

  const web3 = new Web3(providerEngine);

  const zeroEx = new ZeroEx(providerEngine, {
    networkId,
  });
  window.zeroEx = zeroEx;
  window.web3Instance = web3;
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
  NOT_CONNECTED: 'Not connected',
  CONNECTED: 'Connected',
  LOCKED: 'Locked',
};

export const NODE_ADDRESS = '0x004e344251110fa1cb09aa31c95c6598ed07dce6';
// export const NODE_ADDRESS = '0x5409ed021d9299bf6814279a6a1411a7e866a631';
export const SMALLEST_AMOUNT = 0.005;
// Hardcoded - around 1$ for now ($400/eth)
export const TRANSACTION_FEE = 0.0025;
// Percentage fee (our fee)
export const EXCHANGE_FEE = 0;
