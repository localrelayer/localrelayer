const path = require('path');
const webpack = require('webpack');
const merge = require('webpack-merge');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');

const config = require('./webpack.config.base');


module.exports = merge(config, {
  devtool: 'source-map',
  entry: {
    app: [
      path.join(__dirname, 'src/index.jsx'),
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      hash: true,
      template: 'src/index.tpl.html',
      inject: 'body',
      filename: 'index.html',
    }),
    new webpack.DefinePlugin({
      __DEV__: true,
      'process.env.NODE_ENV': JSON.stringify('production'),
      'process.env.BROWSER': true,
    }),
    new webpack.ProvidePlugin({
      React: 'react',
    }),
    new webpack.NamedModulesPlugin(),
    new ExtractTextPlugin({
      filename: 'bundle.css',
    }),
    new webpack.optimize.UglifyJsPlugin({
      compress: {
        warnings: false,
      },
    }),
    new webpack.optimize.DedupePlugin(),
  ],
});
