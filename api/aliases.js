const moduleAlias = require('module-alias');

const aliases = {
  db: `${__dirname}/db`,
  config: `${__dirname}/config`,
  utils: `${__dirname}/utils`,
  redisClient: `${__dirname}/redisClient`,
  logger: `${__dirname}/logger`,
  apiLogger: `${__dirname}/apiServer/apiLogger`,
};

moduleAlias.addAliases(aliases);

module.exports = aliases;
