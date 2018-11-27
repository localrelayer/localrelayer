import {
  RPCSubprovider,
  Web3ProviderEngine,
  ContractWrappers,
} from '0x.js';
import {
  MnemonicWalletSubprovider,
} from '@0x/subproviders';
import {
  Web3Wrapper,
} from '@0x/web3-wrapper';
import {
  HttpClient,
} from '@0x/connect';
import Config from './.config';
import {
  getContractWrappersConfig,
  getContractAddressesForNetwork,
} from '../scenarios/utils/contracts';

// INIT PROVIDER ENGINE AND OTHER WEB3 STUFF

export const mnemonicWallet = new MnemonicWalletSubprovider({
  mnemonic: Config.mnemonic,
  baseDerivationPath: Config.baseDerivationPath,
});

export const httpClient = new HttpClient(Config.relayerUrl);
export const providerEngine = new Web3ProviderEngine();

providerEngine.addProvider(mnemonicWallet);
providerEngine.addProvider(new RPCSubprovider(Config.network.rpcUrl));
providerEngine.start();

export const web3Wrapper = new Web3Wrapper(providerEngine);
export const contractWrappers = new ContractWrappers(
  providerEngine,
  getContractWrappersConfig(Config.network.networkId),
);
export const contractAddresses = getContractAddressesForNetwork(Config.network.networkId);
