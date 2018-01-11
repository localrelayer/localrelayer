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
};
