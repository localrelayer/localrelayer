const path = require('path');

module.exports = {
  components: 'src/components/**/[A-Z]*.jsx',
  require: ['babel-polyfill'],
  webpackConfig: require('./webpack.config.development.js'),
  showUsage: true,
};
