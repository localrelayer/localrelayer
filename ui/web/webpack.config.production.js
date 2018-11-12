const webpack = require('webpack');
const merge = require('webpack-merge');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const S3Plugin = require('webpack-s3-plugin');
const UglifyJSPlugin = require('uglifyjs-webpack-plugin');
// const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

const config = require('./webpack.config.base');


module.exports = merge(config, {
  mode: 'production',
  devtool: 'source-map',
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
      BigNumber: 'bignumber.js',
    }),
    new webpack.NamedModulesPlugin(),
    new ExtractTextPlugin({
      filename: 'bundle.css',
    }),
    new UglifyJSPlugin(),
    new webpack.optimize.DedupePlugin(),
    new S3Plugin({
      s3Options: {
        accessKeyId: 'AKIAIBIKUDUXXS73SUCQ',
        secretAccessKey: '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',
        region: 'us-west-1',
      },
      s3UploadOptions: {
        Bucket: 'instex-app',
      },
      cloudfrontInvalidateOptions: {
        DistributionId: 'E2L8JEDH9NXQMT',
        Items: ['/*'],
      },
    }),
  ],
});
