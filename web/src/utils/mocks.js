export const generateTestOrders = key => ({
  key,
  price: Math.random().toFixed(4),
  amount: Math.random().toFixed(4),
  total: (Math.random() * 5).toFixed(4),
  action: Math.random() > 0.5 ? 'sell' : 'buy',
});
