import '../../../aliases';
import {
  runSyncronizer,
} from '..';

runSyncronizer({
  RELAYER_NAME: 'radar',
  NETWORK_ID: 50,
  API_URL: 'https://api.kovan.radarrelay.com/0x/v2/',
  WEBSOCKET_URL: 'wss://ws.kovan.radarrelay.com/0x/v2',
});
