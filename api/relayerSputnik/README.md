# Microservice that listens to all 0x 'Fill' events and stores trading info in redis

The service listens to all Ganache (id 50) and Kovan (id 42) 0x events and collects trading data (last price, low and high prices, tokenA and tokenB volumes and 24 hour change). Data is expired every 24h.


*Mainnet support is WIP*


You can subscribe to any number of pairs. Format - *makerTokenAddress:takerTokenAddress*

```
  socket.emit('subscribe', {
    pairs: [
      '0x6ff6c0ff1d68b964901f986d4c9fa3ac68346570_0xd0a1e359811322d97991e03f863a0c30c2cf029c',
      '0x871dd7c2b4b25e1aa18728e9d5f2af4c4e431f5c_0x0b1ba0af832d7c05fd64161e0db78e85978e8082',
    ],
  });
```

To process data you need to listen to 'message' event:

```
  socket.on('message', (data) => {
    // Work with data here
  });
```

To run on local machine:

```
yarn start-dev
yarn socket-dev
```

To run an example client:

```
yarn example
```

You also required to run ganache-cli (for Ganache testnet)

Response example:

```
  [{ tradingData:
    {
      lastPrice: '0.07',
      minPrice: '0.07',
      maxPrice: '0.07',
      assetAVolume: '100',
      assetBVolume: '7',
      change24: 0,
    },
    pair: '0x871dd7c2b4b25e1aa18728e9d5f2af4c4e431f5c_0x0b1ba0af832d7c05fd64161e0db78e85978e8082',
  }],
```
