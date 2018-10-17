import sha3 from 'js-sha3';
import * as R from 'ramda';

import ERC20Token from './ERC20Token.json';
import ERC721Token from './ERC721Token.json';
import Exchange from './Exchange.json';
import WETH9 from './WETH9.json';


const contracts = {
  ERC20Token,
  ERC721Token,
  Exchange,
  WETH9,
};


function formatSignature(fragment) {
  return [
    fragment.name,
    '(',
    fragment.inputs.map(i => i.type).join(','),
    ')',
  ].join('');
}


export function getEventsTopics(contractsEvents) {
  return Object.keys(contractsEvents).reduce(
    (acc, contractName) => ({
      ...(
        contracts[contractName].abi
          .filter(
            r => (
              r.type === 'event'
              && contractsEvents[contractName].includes(r.name)
            ),
          ).reduce(
            (topics, event) => {
              const signature = formatSignature(event);
              const topic = `0x${sha3.keccak256(signature)}`;
              return ({
                ...topics,
                [topic]: {
                  topic,
                  name: event.name,
                  signature,
                  abi: event,
                },
              });
            },
            {},
          )
      ),
      ...acc,
    }),
    {},
  );
}

export function getEventsAbi(contractsEvents) {
  return R.flatten(
    Object.keys(contractsEvents).map(
      contractName => (
        contracts[contractName].abi
      ).filter(
        r => (
          r.type === 'event'
          && contractsEvents[contractName].includes(r.name)
        ),
      ),
    ),
  );
}
