/* eslint-disable no-param-reassign */
const path = require('path');
const LessPluginLists = require('less-plugin-lists');
const webpackBaseConfig = require('../webpack.config.base');

module.exports = (storybookBaseConfig, configType) => {
  const projectConfig = webpackBaseConfig({
    NODE_ENV: configType,
  });
  const localPresets = projectConfig.module.rules[0].use.options.presets;
  const localPlugins = projectConfig.module.rules[0].use.options.plugins;
  const storyBookPlugins = storybookBaseConfig.module.rules[0].use[0].options.plugins;
  // babel7 support
  storybookBaseConfig.module.rules[0].include = [
    ...storybookBaseConfig.module.rules[0].include,
    path.resolve(__dirname, '../../core'),
  ];
  storybookBaseConfig.module.rules[0].use[0].options.presets = localPresets;
  storybookBaseConfig.module.rules[0].use[0].options.plugins = [
    ...storyBookPlugins.filter(
      p => !(
        [
          'plugin-transform-regenerator',
          'plugin-transform-runtime',
          'plugin-proposal-class-properties',
        ].some(
          ep => (
            Array.isArray(p) ? p[0].includes(ep) : p.includes(ep)
          ),
        )
      ),
    ),
    ...localPlugins,
  ];
  storybookBaseConfig.module.rules.push({
    test: /\.(less)$/,
    use: [
      'style-loader',
      'css-loader',
      {
        loader: 'less-loader',
        options: {
          javascriptEnabled: true,
          plugins: [
            new LessPluginLists(),
          ],
        },
      },
      'js-to-styles-var-loader',
    ],
  });
  // aliases
  storybookBaseConfig.resolve.alias = {
    ...storybookBaseConfig.resolve.alias,
    ...projectConfig.resolve.alias,
  };
  return storybookBaseConfig;
};
