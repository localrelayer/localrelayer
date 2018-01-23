/*eslint global-require: "ignore"*/
const ignoredComponents = [
  'index',
  'BuySellForm',
  'WrapForm',
];

module.exports = {
  sections: [
    {
      name: 'Header',
      components: () => [
        './src/components/Header/Header.jsx',
        './src/components/Header/TokensList/TokensList.jsx',
      ],
    },
    {
      name: 'OrderBook',
      components: './src/components/OrderBook/OrderBook.jsx',
    },
    {
      name: 'OrdersList',
      components: () => [
        './src/components/OrdersList/OrdersList.jsx',
        './src/components/TradingHistory/TradingHistory.jsx',
        './src/components/OrderBook/OrderBook.jsx',
        './src/components/UserOrders/UserOrders.jsx',
      ],
    },
    {
      name: 'Buy/Sell form',
      components: './src/components/BuySell/BuySell.jsx',
    },
    {
      name: 'User balance',
      components: './src/components/UserBalance/UserBalance.jsx',
    },
  ],
  require: ['babel-polyfill'],
  webpackConfig: require('./webpack.config.development.js'),
  showUsage: true,
};
