module.exports = function (api) {
  api.cache(true);
  const config = {
    presets: [
      [
        '@babel/preset-env',
        {
          targets: {
            node: 'current',
          },
          modules: 'commonjs',
          debug: false,
        },
      ],
    ],
    plugins: [
      '@babel/plugin-proposal-optional-chaining',
    ],
  };
  return config;
};
