const path = require('path');
const lessPluginLists = require('less-plugin-lists');

module.exports = env => ({
  entry: {
    app: [
      path.join(__dirname, 'src/index.jsx'),
    ],
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js',
    publicPath: '/',
  },
  resolve: {
    extensions: ['.js', '.jsx', '.mjs', '.wasm', '.json'],
    alias: {
      components: path.resolve(__dirname, 'src/components'),
    },
  },
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            cacheDirectory: true,
            presets: [
              [
                '@babel/preset-env',
                {
                  targets: {
                    // Actually we don't need to support so much browser
                    // TODO: figure out which exactly browser we have to support
                    browsers: [
                      'last 2 versions',
                    ],
                  },
                  modules: false,
                  useBuiltIns: 'entry',
                },
              ],
              [
                '@babel/preset-react',
                {
                  development: env === 'development',
                },
              ],
              '@babel/preset-flow',
            ],
            plugins: [
              '@babel/plugin-proposal-export-namespace-from',
              '@babel/plugin-proposal-export-default-from',
              '@babel/plugin-proposal-class-properties',
              '@babel/plugin-proposal-optional-chaining',
              '@babel/plugin-proposal-do-expressions',
              [
                // used only for babel helpers
                '@babel/plugin-transform-runtime',
                {
                  // regenerator runtime should be used from global polyfill
                  regenerator: false,
                  // define babel helpers as es modules
                  useESModules: true,
                },
              ],
              [
                'babel-plugin-styled-components',
                {
                  displayName: true,
                },
              ],
              [
                'import',
                {
                  libraryName: 'antd',
                  libraryDirectory: 'es',
                  style: 'less',
                },
              ],
            ],
            env: {
              development: {
                plugins: [
                  'react-hot-loader/babel',
                ],
              },
            },
          },
        },
      },
      {
        test: /\.(css)$/,
        use: [
          'style-loader',
          'css-loader',
        ],
      },
      {
        test: /\.(less)$/,
        use: [
          'style-loader',
          'css-loader',
          {
            loader: 'less-loader',
            options: {
              javascriptEnabled: true,
              plugins: [
                new lessPluginLists(),
              ],
            },
          },
        ],
      },
      // WOFF/WOFF2 Fonts
      {
        test: /\.woff(.*)?$/,
        use: {
          loader: 'url-loader',
          options: {
            limit: 10000,
            mimetype: 'application/font-woff',
          },
        },
      },
      // TTF Fonts
      {
        test: /\.ttf(.*)?$/,
        use: {
          loader: 'url-loader',
          options: {
            limit: 10000,
            mimetype: 'application/octet-stream',
          },
        },
      },
      // SVG
      {
        test: /\.svg(.*)?$/,
        use: {
          loader: 'svg-inline-loader',
        },
      },
      // Common Image Formats
      {
        test: /\.(?:ico|gif|png|jpg|jpeg|eot|webp)$/,
        use: [
          {
            loader: 'file-loader',
            options: {
              name: '[path][name].[ext]',
            },
          },
        ],
      },
    ],
  },
});
