const webpack = require('webpack');
const merge = require('webpack-merge');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const S3Plugin = require('webpack-s3-plugin');

const config = require('./webpack.config.base');

module.exports = merge(config, {
  mode: 'production',
  devtool: 'source-map',
  optimization: {
    minimize: true,
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
