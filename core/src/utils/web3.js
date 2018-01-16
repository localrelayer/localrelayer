export const loadWeb3 = () =>
  new Promise((resolve) => {
    // Wait for loading completion to avoid race conditions with web3 injection timing.
    window.addEventListener('load', () => {
      let { web3 } = window;
      // Checking if Web3 has been injected by the browser (Mist/MetaMask)
      if (typeof web3 !== 'undefined') {
        // Use Mist/MetaMask's provider.
        web3 = new Web3(web3.currentProvider);

        console.warn('Injected web3 detected.');
        resolve(web3);
      } else {
        console.warn('No web3 instance injected, please use Metamask');
      }
    });
  });
