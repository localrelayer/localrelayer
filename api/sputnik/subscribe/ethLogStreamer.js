import fetch from 'node-fetch';
import {
  AbiDecoder,
} from '0x.js';
import {
  BlockAndLogStreamer,
} from 'ethereumjs-blockstream';

import {
  getEventsAbi,
} from 'utils';
import {
  logger,
} from '../sputnikLogger';


const streamConfigState = {
  main: {
    id: 1,
    reqId: 0,
    rpcUrl: 'https://mainnet.infura.io/v3/240b30f52dcb42e0a051a4acdfe00d8e',
  },
  kovan: {
    id: 42,
    reqId: 0,
    rpcUrl: 'https://kovan.infura.io/v3/240b30f52dcb42e0a051a4acdfe00d8e',
  },
  test: {
    id: 50,
    reqId: 0,
    rpcUrl: 'http://localhost:8545',
  },
};

const getBlockByHash = networkName => async (hash) => {
  const config = streamConfigState[networkName];
  config.reqId += 1;
  const response = await fetch(
    config.rpcUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: config.reqId,
        method: 'eth_getBlockByHash',
        params: [hash, false],
      }),
    },
  );
  const json = await response.json();
  return json.result;
};

const getLogs = networkName => async (filterOptions) => {
  const config = streamConfigState[networkName];
  config.reqId += 1;
  const response = await fetch(
    config.rpcUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: config.reqId,
        method: 'eth_getLogs',
        params: [filterOptions],
      }),
    },
  );
  const json = await response.json();
  return json.result;
};

const getLatestBlock = networkName => async () => {
  const config = streamConfigState[networkName];
  config.reqId += 1;
  const response = await fetch(
    config.rpcUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: config.reqId,
        method: 'eth_getBlockByNumber',
        params: [
          'latest',
          false,
        ],
      }),
    },
  );
  const json = await response.json();
  return json.result;
};


export function subscribeOnEvents({
  networkName,
  watchEvents,
  handler,
}) {
  let runCheck = true;
  const eventsAbi = getEventsAbi(watchEvents);
  const decoder = new AbiDecoder([eventsAbi]);
  const blockAndLogStreamer = new BlockAndLogStreamer(
    getBlockByHash(networkName),
    getLogs(networkName),
    (e) => {
      logger.error(e);
    },
    {
      blockRetention: 100,
    },
  );
  blockAndLogStreamer.addLogFilter({});
  blockAndLogStreamer.subscribeToOnLogAdded(
    (rawLog) => {
      const decodedLog = decoder.tryToDecodeLogOrNoop(rawLog);
      handler(decodedLog);
    },
  );

  /* https://github.com/0xProject/0x-monorepo/blob/master/packages/contract-wrappers/src/contract_wrappers/contract_wrapper.ts */
  async function check() {
    try {
      logger.debug('Run check');
      const fetchLatestBlock = getLatestBlock(networkName);
      const latestBlock = await fetchLatestBlock();
      await blockAndLogStreamer.reconcileNewBlock(latestBlock);
    } catch (err) {
      logger.error(err);
    }
    setTimeout(async () => {
      if (runCheck) {
        await check(blockAndLogStreamer, networkName);
      }
    }, 1000);
  }
  check(blockAndLogStreamer, networkName);
  return () => {
    runCheck = false;
  };
}
