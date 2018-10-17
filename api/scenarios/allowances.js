import {
  ContractWrappers,
} from '0x.js';

import {
  Web3Wrapper,
} from '@0xproject/web3-wrapper';
import {
  providerEngine,
} from './utils/providerEngine';
import {
  PrintUtils,
} from './utils/printing';
import {
  GANACHE_NETWORK_ID,
} from './utils/constants';

export async function scenarioAsync() {
  PrintUtils.printScenario('Allowances');
  // Initialize the ContractWrappers, this provides helper functions around calling
  // 0x contracts as well as ERC20/ERC721 token contracts on the blockchain
  const contractWrappers = new ContractWrappers(
    providerEngine,
    {
      networkId: GANACHE_NETWORK_ID,
    },
  );
  // Initialize the Web3Wrapper, this provides helper functions around fetching
  // account information, balances, general contract logs
  const web3Wrapper = new Web3Wrapper(providerEngine);
  const [maker, taker] = await web3Wrapper.getAvailableAddressesAsync();
  const zrxTokenAddress = contractWrappers.exchange.getZRXTokenAddress();
  const etherTokenAddress = contractWrappers.etherToken.getContractAddressIfExists();
  if (!etherTokenAddress) {
    throw new Error('Ether Token not found on this network');
  }
  const printUtils = new PrintUtils(
    web3Wrapper,
    contractWrappers,
    { maker, taker },
    { WETH: etherTokenAddress, ZRX: zrxTokenAddress },
  );
  // Print out the Allowances
  await printUtils.fetchAndPrintContractAllowancesAsync();

  providerEngine.stop();
}

(async () => {
  try {
    if (!module.parent) {
      await scenarioAsync();
    }
  } catch (e) {
    console.log(e);
    providerEngine.stop();
    process.exit(1);
  }
})();
