export const generateTestOrders = key => ({
  key,
  price: Math.random().toFixed(4),
  amount: Math.random().toFixed(4),
  total: (Math.random() * 5).toFixed(4),
  action: Math.random() > 0.5 ? 'sell' : 'buy',
});

export const testToken = {
  symbol: 'TEST',
  tradingPair: 'WETH',
  highPrice: '0.022',
  lowPrice: '0.015',
  tradingVolume: 211,
  change24Hour: 11,
  lastPrice: '0.021',
  id: 1,
};

export const testTokens = [
  {
    balance: '120.5422',
    symbol: 'EQC',
    name: 'Ethereum Qchain',
    key: 1,
    tradable: false,
  },
  {
    balance: '50.00',
    symbol: 'CMS',
    name: 'Comsa',
    key: 2,
    tradable: true,
  },
  {
    balance: '1.25',
    symbol: 'TEST',
    name: 'Test Wrapper',
    key: 3,
    tradable: false,
  },
];
