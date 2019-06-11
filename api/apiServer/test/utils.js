import '../../aliases';
import supertest from 'supertest';
import {
  assetDataUtils,
  generatePseudoRandomSalt,
  Web3ProviderEngine,
  RPCSubprovider,
  BigNumber,
  ContractWrappers,
  orderHashUtils,
  signatureUtils,
} from '0x.js';
import {
  MnemonicWalletSubprovider,
} from '@0x/subproviders';
import {
  Web3Wrapper,
} from '@0x/web3-wrapper';

import config from 'config';
import {
  app,
} from '..';
import {
  NULL_ADDRESS,
  ORDER_FIELDS,
  getOrderConfig,
  getContractAddressesForNetwork,
} from 'utils';

export const request = supertest.agent(app.listen(config.apiPort));


export function initTestProvider() {
  const mnemonicWallet = new MnemonicWalletSubprovider({
    mnemonic: 'stereo cheese harsh ordinary scrub media chair beauty artist poet ranch attack',
    baseDerivationPath: '44\'/60\'/0\'/0',
  });
  const pe = new Web3ProviderEngine();
  pe.addProvider(mnemonicWallet);
  pe.addProvider(new RPCSubprovider('http://localhost:8545'));
  pe.start();
  return pe;
}


export const createOrder = async ({
  baseAssetData,
  quoteAssetData,
  makerAssetAmount,
  takerAssetAmount,
  sortPlace,
  expirationTime,
  takerFee,
}) => {
  const randomExpiration = new BigNumber(Date.now() + 1000000).div(900).ceil();
  const orderConfig = getOrderConfig();

  const zrxToken = '0xf47261b00000000000000000000000000b1ba0af832d7c05fd64161e0db78e85978e8082';
  const etherToken = '0xf47261b0000000000000000000000000871dd7c2b4b25e1aa18728e9d5f2af4c4e431f5c';

  const testData = {
    makerAddress: () => NULL_ADDRESS,
    takerAddress: () => NULL_ADDRESS,
    makerAssetAmount: () => (makerAssetAmount
      ? Web3Wrapper.toBaseUnitAmount(new BigNumber(makerAssetAmount), 18).toString()
      : Web3Wrapper.toBaseUnitAmount(new BigNumber(0.02), 18)).toString(),
    takerAssetAmount: () => (takerAssetAmount
      ? Web3Wrapper.toBaseUnitAmount(new BigNumber(takerAssetAmount), 18).toString()
      : Web3Wrapper.toBaseUnitAmount(new BigNumber(0.01), 18)).toString(),
    makerAssetData: () => quoteAssetData || etherToken,
    takerAssetData: () => baseAssetData || zrxToken,
    exchangeAddress: () => getContractAddressesForNetwork(50).exchange,
    salt: () => generatePseudoRandomSalt().toString(),
    expirationTimeSeconds: () => (
      expirationTime ? new BigNumber(expirationTime).toString() : randomExpiration.toString()
    ),
    signature: () => NULL_ADDRESS,
  };

  const web3ProviderEngine = initTestProvider();

  const web3Wrapper = new Web3Wrapper(web3ProviderEngine);
  const [makerAddress] = await web3Wrapper.getAvailableAddressesAsync();
  // const networkId = 50;
  // const contractAddresses = getContractAddressesForNetwork(networkId);
  // const contractWrappers = new ContractWrappers(
  //   web3ProviderEngine,
  //   {
  //     networkId,
  //     contractAddresses,
  //   },
  // );

  // await contractWrappers.erc20Token.setUnlimitedProxyAllowanceAsync(
  //   contractAddresses.etherToken,
  //   makerAddress,
  // );

  const order = (
    ORDER_FIELDS
      .reduce((acc, fieldName) => ({
        [fieldName]: (
          orderConfig[fieldName]
          || testData[fieldName]()
        ),
        ...acc,
      }), {
        makerAddress,
        takerFee: takerFee || orderConfig.takerFee,
      })
  );
  const orderHash = orderHashUtils.getOrderHashHex(order);
  const signature = await signatureUtils.ecSignHashAsync(
    web3ProviderEngine,
    orderHash,
    makerAddress,
  );

  web3ProviderEngine.stop();

  return {
    ...order,
    signature,
    sortPlace,
  };
};
