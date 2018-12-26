import '../../../aliases';
import {
  runSyncronizer,
} from '..';

runSyncronizer({
  RELAYER_NAME: 'radar',
  NETWORK_ID: 1,
  API_URL: 'https://api.radarrelay.com/0x/v2/',
  WEBSOCKET_URL: 'wss://ws.radarrelay.com/0x/v2',
});
