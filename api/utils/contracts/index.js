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
