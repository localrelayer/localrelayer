/* eslint-disable global-require */
if (process.env.NODE_ENV === 'production') {
  module.exports = require('./config.prod');
} else if (process.env.NODE_ENV === 'development') {
  module.exports = require('./config.dev');
}
