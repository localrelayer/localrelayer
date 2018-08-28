import 'web3';
import ethApi from 'instex-core';
import {
  actionTypes,
} from 'instex-core/actions';
import store from './store';

/**
 * ETHEREUM_PROVIDER_SUCCESS will be dispatched when web3 instance appear in global scope
 * which mean the app conntected to the ethereum net.
 *
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
          type: actionTypes.ETHEREUM_PROVIDER_SUCCESS,
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
      type: actionTypes.ETHEREUM_PROVIDER_SUCCESS,
    });
  }
});
