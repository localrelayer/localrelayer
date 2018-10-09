import fetch from 'node-fetch';
import {
  BlockAndLogStreamer,
} from 'ethereumjs-blockstream';
/* https://github.com/ethereumjs/ethereumjs-blockstream */


let id = 0;

async function getBlockByHash(hash) {
  id += 1;
  const response = await fetch(
    'http://localhost:8545', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id,
        method: 'eth_getBlockByHash',
        params: [hash, false],
      }),
    },
  );
  const json = await response.json();
  console.log('****getBlockByHash****');
  console.log(json);
  console.log('********');
  return json.result;
}

async function getLogs(filterOptions) {
  id += 1;
  console.log('filter');
  console.log(filterOptions);
  console.log('filter');
  const response = await fetch(
    'http://localhost:8545', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id,
        method: 'eth_getLogs',
        params: [filterOptions],
      }),
    },
  );
  const json = await response.json();
  console.log('****getLogs****');
  console.log(json);
  console.log('********');
  return json.result;
}

async function getLatestBlock() {
  id += 1;
  const response = await fetch(
    'http://localhost:8545', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id,
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
}

/* https://github.com/0xProject/0x-monorepo/blob/master/packages/contract-wrappers/src/contract_wrappers/contract_wrapper.ts */
async function check(blockAndLogStreamer) {
  const latestBlock = await getLatestBlock();
  await blockAndLogStreamer.reconcileNewBlock(latestBlock);
  setTimeout(async () => {
    await check(blockAndLogStreamer);
  }, 1000);
}

export function customsSubscribe() {
  const blockAndLogStreamer = new BlockAndLogStreamer(
    getBlockByHash,
    getLogs,
    (e) => {
      console.log('======Error=========');
      console.log(e);
      console.log('======Error=========');
    },
    {
      blockRetention: 100,
    },
  );
  blockAndLogStreamer.addLogFilter({});
  blockAndLogStreamer.subscribeToOnLogAdded(
    (log) => {
      console.log('****logAdded****');
      console.log(log);
      console.log('********');
    },
  );
  blockAndLogStreamer.subscribeToOnBlockAdded(
    (block) => {
      console.log('****blockAdded****');
      console.log(block);
      console.log('********');
    },
  );
  check(blockAndLogStreamer);
}
