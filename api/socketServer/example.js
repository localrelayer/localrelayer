import WebSocket from 'ws';
import uuidv4 from 'uuid/v4';

const ws = new WebSocket('ws://localhost:5003');

ws.on('open', () => {
  ws.send(JSON.stringify({
    type: 'subscribe',
    channel: 'orders',
    requestId: uuidv4(),
    payload: {
      networkId: 50,
      makerAssetAddress: '0x0b1ba0af832d7c05fd64161e0db78e85978e8082',
    },
  }));
});

ws.on('message', (data) => {
  console.log(data);
});
