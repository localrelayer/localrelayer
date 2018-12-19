/* eslint no-underscore-dangle: ["error", { "allow": ["__STORYBOOK_CLIENT_API__"] }] */
import Web3 from 'web3';
import {
  ethApi,
} from 'instex-core';
import {
  actionTypes,
} from 'web-actions';
import store from './store';

/**
 * INITIALIZE_WEB_APP will be dispatched when web3 instance appear in global scope
 * which mean the app conntected to the ethereum net.
 *
 * https://github.com/MetaMask/metamask-extension/issues/4998
 * https://medium.com/metamask/https-medium-com-metamask-breaking-change-injecting-web3-7722797916a8
 */
window.addEventListener('load', async () => {
  // Modern dapp browsers...
  if (window.ethereum) {
    window.web3 = new Web3(window.ethereum);
    try {
      // Request account access if needed
      window.onfocus = async () => {
        await window.ethereum.enable();
        ethApi.setWeb3(window.web3);
        store.dispatch({
          type: actionTypes.INITIALIZE_WEB_APP,
          historyType: window.__STORYBOOK_CLIENT_API__ ? 'memory' : 'browser',
        });
      };
    } catch (error) {
      // User denied account access...
      console.log('User denied', error);
    }
    // Legacy dapp browsers...
  } else if (window.web3) {
    window.web3 = new Web3(web3.currentProvider);
    ethApi.setWeb3(window.web3);
    store.dispatch({
      type: actionTypes.INITIALIZE_WEB_APP,
      historyType: window.__STORYBOOK_CLIENT_API__ ? 'memory' : 'browser',
    });
  } else {
    // Non-dapp browsers...
    window.web3 = null;
    console.log('Non-Ethereum browser detected. You should consider trying MetaMask!');
    store.dispatch({
      type: actionTypes.INITIALIZE_WEB_APP,
      historyType: window.__STORYBOOK_CLIENT_API__ ? 'memory' : 'browser',
    });
  }
});
