import supertest from 'supertest';
import {
  assetDataUtils,
  generatePseudoRandomSalt,
  RPCSubprovider,
  BigNumber,
} from '0x.js';
import {
  MnemonicWalletSubprovider,
} from '@0x/subproviders';
import {
  Web3Wrapper,
} from '@0x/web3-wrapper';

import {
  initWeb3ProviderEngine,
} from 'utils';
import config from 'config';
import {
  app,
} from '..';

export const request = supertest.agent(app.listen(config.apiPort));

export const createOrder = ({
  baseAssetData,
  quoteAssetData,
  makerAssetAmount,
  takerAssetAmount,
  takerFee,
  sortPlace,
  expirationTime,
}) => {
  const maker = '0x6ecbe1db9ef729cbe972c83fb886247691fb6beb';
  const zrxTokenAddress = '0x0b1ba0af832d7c05fd64161e0db78e85978e8082';
  const etherTokenAddress = '0x871dd7c2b4b25e1aa18728e9d5f2af4c4e431f5c';
  const makerAssetData = baseAssetData || assetDataUtils.encodeERC20AssetData(zrxTokenAddress);
  const takerAssetData = quoteAssetData || assetDataUtils.encodeERC20AssetData(etherTokenAddress);
  const randomExpiration = new BigNumber(Date.now() + 1000000).div(900).ceil();
  const exchangeAddress = '0x48bacb9266a570d521063ef5dd96e61686dbe788';
  const orderConfigRequest = {
    exchangeAddress,
    makerAddress: maker,
    takerAddress: '0x0000000000000000000000000000000000000000',
    expirationTimeSeconds: expirationTime ? new BigNumber(expirationTime) : randomExpiration,
    makerAssetAmount: makerAssetAmount
      ? Web3Wrapper.toBaseUnitAmount(new BigNumber(makerAssetAmount), 18)
      : Web3Wrapper.toBaseUnitAmount(new BigNumber(5), 18),
    takerAssetAmount: takerAssetAmount
      ? Web3Wrapper.toBaseUnitAmount(new BigNumber(takerAssetAmount), 18)
      : Web3Wrapper.toBaseUnitAmount(new BigNumber(0.1), 18),
    makerAssetData,
    takerAssetData,
  };
  const orderConfig = {
    senderAddress: '0x0000000000000000000000000000000000000000',
    feeRecipientAddress: '0x0000000000000000000000000000000000000000',
    makerFee: new BigNumber(0),
    takerFee: takerFee || '1000',
  };
  const order = {
    salt: generatePseudoRandomSalt(),
    ...orderConfigRequest,
    ...orderConfig,
  };
  const signature = '0x1c056b86843458e1bbd2fc55efd4cc259f072267bfe3b7f5a11321ae46211a8211665adbd2ef8c0ebc32dcd529ea0113196e208c046af271e24e76e627b6c53af003';
  return {
    ...order,
    signature,
    sortPlace,
  };
};

export function initTestProvider() {
  const mnemonicWallet = new MnemonicWalletSubprovider({
    mnemonic: 'stereo cheese harsh ordinary scrub media chair beauty artist poet ranch attack',
    baseDerivationPath: '44\'/60\'/0\'/0',
  });
  const pe = initWeb3ProviderEngine(
    50,
    false,
  );
  pe.addProvider(mnemonicWallet);
  pe.addProvider(new RPCSubprovider('http://localhost:8545'));
  pe.start();
  return pe;
}
