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
        resolve(null);
        console.warn('No web3 instance injected, please use Metamask');
      }
    });
  });

export const getNetworkById = (id: number) => {
  const networks = {
    '1': 'Mainnet',
    '2': 'Morden (deprecated)',
    '3': 'Ropsten Test',
    '4': 'Rinkbery Test',
    '42': 'Kovan Test',
  };
  return networks[id] || 'Unknown network.';
};

export const connectionStatuses = {
  NOT_CONNECTED: 'Not connected to Ethereum',
  CONNECTED: 'Connected',
  LOCKED: 'Locked',
};

