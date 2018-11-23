module.exports = {
  SSL: false,
  apiPort: 5001,
  socketPort: 5003,
  mongo: 'mongodb://127.0.0.1:27017/relayerDev',
  redis: {
    port: 6379,
    host: '127.0.0.1',
  },
  checkShadowedOrdersInSeconds: 300, /* 5 mins */
  shadowedOrderslifeTimeinMs: 600 * 1000, /* 10 mins */
};
