import 'module-alias/register';
import {
  ContractWrappers,
  assetDataUtils,
  BigNumber,
} from '0x.js';
import {
  Web3Wrapper,
} from '@0x/web3-wrapper';
import {
  MnemonicWalletSubprovider,
} from '@0x/subproviders';


import {
  AssetPair,
} from 'db';
import {
  initWeb3ProviderEngine,
  getContractAddressesForNetwork,
  TEST_WALLET_1,
  TEST_WALLET_2,
} from 'utils';

(async () => {
  const networkId = 50;
  const testWallet1 = new MnemonicWalletSubprovider({
    mnemonic: TEST_WALLET_1.mnemonic,
    baseDerivationPath: '44\'/60\'/0\'/0',
  });
  const testWallet2 = new MnemonicWalletSubprovider({
    mnemonic: TEST_WALLET_2.mnemonic,
    baseDerivationPath: '44\'/60\'/0\'/0',
  });
  const web3ProviderEngine = initWeb3ProviderEngine(
    networkId,
  );
  web3ProviderEngine.unshiftProvider(testWallet1);

  const web3Wrapper = new Web3Wrapper(web3ProviderEngine);
  const availableAddresses = await web3Wrapper.getAvailableAddressesAsync();
  web3ProviderEngine.unshiftProvider(testWallet2);
  const availableAddresses2 = await web3Wrapper.getAvailableAddressesAsync();

  const contractAddresses = getContractAddressesForNetwork(networkId);
  const contractWrappers = new ContractWrappers(
    web3ProviderEngine,
    {
      networkId,
      contractAddresses,
    },
  );
  const assetPairs = await AssetPair.find({
    networkId,
  });
  const balance = await Promise.all(
    assetPairs.map(pair => (
      contractWrappers.erc20Token.getBalanceAsync(
        assetDataUtils.decodeAssetDataOrThrow(
          pair.assetDataA.assetData,
        ).tokenAddress,
        availableAddresses2[0],
      )
    )),
  );

  /* Promise.all will not work cause of nonce, transfer can be invoked only by sequence */
  for (const index in assetPairs) { /* eslint-disable-line */
    try {
      await contractWrappers.erc20Token.transferAsync( /* eslint-disable-line */
        assetDataUtils.decodeAssetDataOrThrow(
          assetPairs[index].assetDataA.assetData,
        ).tokenAddress,
        availableAddresses2[0],
        availableAddresses[1],
        new BigNumber(balance[index] / 2),
      );
    } catch (err) {
      console.log(err);
    }
  }
  web3ProviderEngine.stop();
  process.exit();
})();
