import knexConfig from '../../knexfile';

export default {
  showLogs: false,
  showDocs: true,
  useSentry: true,
  port: 3001,
  apiUrl: 'https://api.instex.io/api',
  dbUrl: knexConfig.production.connection,
  redis: {
    port: 6379,
    host: '127.0.0.1',
    password: ''
  },
};
