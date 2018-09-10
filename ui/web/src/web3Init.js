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
window.addEventListener('load', () => {
  // If web3 is not injected (modern browsers)...
  if (typeof web3 === 'undefined') {
    // Listen for provider injection
    window.addEventListener('message', ({ data }) => {
      if (data && data.type && data.type === 'ETHEREUM_PROVIDER_SUCCESS') {
        // Use injected provider, start dapp...
        web3 = new Web3(ethereum);
        ethApi.setWeb3(web3);
        store.dispatch({
          type: actionTypes.INITIALIZE_WEB_APP,
        });
      }
    });
    // Request provider
    window.postMessage({ type: 'ETHEREUM_PROVIDER_REQUEST' }, '*');
  // If web3 is injected (legacy browsers)...
  } else {
    // Use injected provider, start dapp
    web3 = new Web3(web3.currentProvider);
    ethApi.setWeb3(web3);
    store.dispatch({
      type: actionTypes.INITIALIZE_WEB_APP,
    });
  }
});
