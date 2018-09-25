const { transform } = require('@babel/core');
const webpackBaseConfig = require('./webpack.config.base');

const webBabelConfig = webpackBaseConfig({
  NODE_ENV: 'testing',
}).module.rules[0].use.options;
/* Remove import plugin to not handle antd style files at all */
webBabelConfig.plugins.splice(-1, 1);

module.exports = {
  process(src, filename) {
    return transform(
      src,
      {
        filename,
        presets: [
          [
            '@babel/preset-env',
            {
              targets: {
                node: '10',
              },
            },
          ],
          [
            '@babel/preset-react',
            {
              development: true,
            },
          ],
          '@babel/preset-flow',
        ],
        plugins: webBabelConfig.plugins,
      },
    );
  },
};
