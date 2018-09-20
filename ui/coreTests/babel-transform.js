const { transform } = require('@babel/core');

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
          '@babel/preset-flow',
        ],
        plugins: [
          '@babel/plugin-proposal-export-namespace-from',
          '@babel/plugin-proposal-export-default-from',
          '@babel/plugin-transform-runtime',
        ],
      },
    );
  },
};
