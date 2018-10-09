import knexConfig from '../../knexfile';

export default {
  showLogs: true,
  showDocs: true,
  port: 3001,
  apiUrl: 'http://localhost:3001/api',
  dbUrl: knexConfig.test.connection,
  redis: {
    port: 6379,
    host: '127.0.0.1',
    password: ''
  },
};
