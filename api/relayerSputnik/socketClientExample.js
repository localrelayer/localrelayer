import io from 'socket.io-client';

// Example client
console.log('_______');
// console.log('Socket connecting', 'http://localhost:8081');
console.log('Socket connecting', 'http://localhost:5003');
console.log('_______');
// const socket = io('http://localhost:8081');
const socket = io('http://localhost:5003');

socket.on('connect', () => {
  socket.emit('subscribe', {
    pairs: [
      '0x6ff6c0ff1d68b964901f986d4c9fa3ac68346570_0xd0a1e359811322d97991e03f863a0c30c2cf029c',
      '0x871dd7c2b4b25e1aa18728e9d5f2af4c4e431f5c_0x0b1ba0af832d7c05fd64161e0db78e85978e8082',
    ],
  });

  socket.on('message', (data) => {
    console.log(data);
  });
});
