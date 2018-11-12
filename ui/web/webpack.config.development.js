const path = require('path');
const webpack = require('webpack');
const merge = require('webpack-merge');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const config = require('./webpack.config.base');


module.exports = env => merge(config(env), {
  mode: 'development',
  devtool: 'eval-source-map',
  plugins: [
    new HtmlWebpackPlugin({
      template: 'src/index.tpl.html',
      inject: 'body',
      filename: 'index.html',
    }),
    new webpack.ProvidePlugin({
      React: 'react',
      BigNumber: 'bignumber.js',
    }),
    new webpack.NamedModulesPlugin(),
    new webpack.HotModuleReplacementPlugin(),
  ],

  devServer: {
    contentBase: path.resolve(__dirname, 'dist'),
    port: 3000,
    hot: true,
    lazy: false,
    compress: true,
    stats: 'minimal',
    watchOptions: {
      aggregateTimeout: 1000,
      ignored: /node_modules/,
      poll: 100,
    },
    historyApiFallback: {
      verbose: true,
      disableDotRule: true,
    },
  },
});
