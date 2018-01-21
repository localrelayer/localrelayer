/*eslint global-require: "ignore"*/
const ignoredComponents = [
  'index',
  'BuySellForm',
  'WrapForm',
];

module.exports = {
  components: `./src/components/!(ReduxFormComponents)/!(${ignoredComponents.join('|')}).jsx`,
  require: ['babel-polyfill'],
  webpackConfig: require('./webpack.config.development.js'),
  showUsage: true,
};
