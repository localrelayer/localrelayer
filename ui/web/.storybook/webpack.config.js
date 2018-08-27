const path = require("path");
const LessPluginLists = require('less-plugin-lists');
const webpackBaseConfig = require('../webpack.config.base');

module.exports = (storybookBaseConfig, configType) => {
  const projectConfig = webpackBaseConfig({
    NODE_ENV: configType,
  });
  // babel7 support
  storybookBaseConfig.module.rules[0].include = [
    ...storybookBaseConfig.module.rules[0].include,
    path.resolve(__dirname, '../../core'),
  ];
  storybookBaseConfig.module.rules[0].use[0].options.presets =
    projectConfig.module.rules[0].use.options.presets;
  storybookBaseConfig.module.rules[0].use[0].options.plugins = [
    ...projectConfig.module.rules[0].use.options.plugins,
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
  }
  return storybookBaseConfig;
};
