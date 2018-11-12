import {
  ContractWrappers,
} from '0x.js';

import {
  Web3Wrapper,
} from '@0x/web3-wrapper';
import {
  providerEngine,
} from './utils/providerEngine';
import {
  getContractAddressesForNetwork,
  getContractWrappersConfig,
} from './utils/contracts';
import {
  PrintUtils,
} from './utils/printing';
import {
  NETWORK_CONFIGS,
} from './utils/configs';

export async function scenarioAsync() {
  PrintUtils.printScenario('Allowances');
  // Initialize the ContractWrappers, this provides helper functions around calling
  // 0x contracts as well as ERC20/ERC721 token contracts on the blockchain
  const contractWrappers = new ContractWrappers(
    providerEngine,
    getContractWrappersConfig(NETWORK_CONFIGS.networkId),
  );
  const contractAddresses = getContractAddressesForNetwork(NETWORK_CONFIGS.networkId);
  // Initialize the Web3Wrapper, this provides helper functions around fetching
  // account information, balances, general contract logs
  const web3Wrapper = new Web3Wrapper(providerEngine);
  const [maker, taker] = await web3Wrapper.getAvailableAddressesAsync();
  const zrxTokenAddress = contractAddresses.zrxToken;
  const etherTokenAddress = contractAddresses.etherToken;
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
