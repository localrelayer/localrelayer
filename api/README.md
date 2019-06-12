# Local Relayer API

### Requirements
  + [node](https://nodejs.org/) version should be >= 8 `node -v`
  + [npm](https://www.npmjs.com/) version should be >= 5 `npm -v`
  + [redis-server](https://redis.io/)
  + [mongodb](https://www.mongodb.com/)

### Installation

```js
  npm i
  unzip 0x_ganache_snapshot.zip
```

Depending on your environment:

```js
    npm run plantAssetPairs:dev
    npm run plantAssetPairs:test
    npm run plantAssetPairs:prod
```

### Running

You should have redis-server and mongod running in the system

There are 2 ways to run LocalRelayer Backend

1. [Dashboard](#dashboard) - *Recommended*
2. [Manually](#manually)

#### Dashboard
The dashboard is an execution environment implemented as a console application. 
The main purpose of the dashboard is the automated execution processes, scenarios and tests.
In order to run dashboard execute next commands:
```
npm run dashboard
```
It contains three elements:
- **Output** is simply consoled output of currently executing a process (on the left)
- **Logs** show structured logs of the current process
                      (current process mark with *) which are taken from redis (on the top right)
- **Execution list** contains all available processes and scenarios 
                                          to execute (on the bottom right)

At the footer are displayed available actions for each executing list item. E.g. **r** - run the process, **s** - stop 
the process, **t** - show/hide scenarios, **Enter** - choose process which logs will be shown in Logs box etc.

In order to add your own process, scenario or test to Execution list, you have to insert it into a suitable array in
**dashboard/index.js** (i.e. processes, scenarios or tests array). It's possible to select processes that will be execute
automatically after dashboard starting, for this reason, add process id in **dashboard/.config.js**, pay attention that 
**.config.js** only stores locally and should never be pushed to remote.

#### Manually

```js
  npm run api:dev
  npm run socket:dev
  npm run orderWatcher:dev
```

If you need local Testnet:
```js
  npm run ganache:dev
```

### Tests

You can run tests from [dashboard](#dashboard) or by hand:
```js
  npm run test:api
```

### Scenarios

Different scenarious to test 0x connection and [SRA](https://github.com/0xProject/standard-relayer-api).

```js
  npm run scenario:fillOrderSRA
  npm run scenario:fillOrderERC20
  npm run scenario:fillOrderFees
  npm run scenario:forwarderBuyERC20Tokens
  npm run scenario:executeTransaction
  npm run scenario:matchOrders
  npm run scenario:exchangeSubscribe
  npm run scenario:cancelOrders
  npm run scenario:executeTransactionCancelOrder
```

### Emulator (WIP)

**IMPORTANT: DO NOT USE WITH MAINNET**

*If needed you can change tradingEmulator/.config.js*

Simple trading bot to spam exchange with orders and order fills.
Used to stress test the exchange.

```js
  npm run emulator
```
