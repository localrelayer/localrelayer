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
export const BIGGEST_AMOUNT = 1;
// Hardcoded - around 1$ for now ($400/eth)
export const TRANSACTION_FEE = 0.0025;
// Percentage fee (our fee)
export const EXCHANGE_FEE = 0;
