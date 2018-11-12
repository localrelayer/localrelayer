import supertest from 'supertest';
import {
  assetDataUtils,
  generatePseudoRandomSalt,
  RPCSubprovider,
  Web3ProviderEngine,
  BigNumber,
} from '0x.js';
import {
  MnemonicWalletSubprovider,
} from '@0x/subproviders';
import {
  Web3Wrapper,
} from '@0x/web3-wrapper';

import {
  app,
} from '..';
import config from '../../config';

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

/* https://github.com/Marak/faker.js/blob/master/lib/finance.js#L223 */
export function randomEthereumAddress() {
  const hexadecimalSymbols = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'a', 'b', 'c', 'd', 'e', 'f'];
  const randomHex = Array(40).fill().map(
    () => (
      hexadecimalSymbols[Math.floor(Math.random() * hexadecimalSymbols.length)]
    ),
  );
  return `0x${randomHex.join('')}`;
}

export function toBaseUnit(amount, decimals) {
  const unit = new BigNumber(10).pow(decimals);
  return (new BigNumber(amount)).times(unit);
}

export function generateRandomMakerAssetAmount(decimals) {
  const amount = new BigNumber(Math.round(Math.random() * 100) + 10);
  return toBaseUnit(
    amount,
    decimals,
  );
}

export function generateRandomTakerAssetAmount(decimals) {
  const amount = new BigNumber(Math.round(Math.random() * 5) + 15);
  return toBaseUnit(
    amount,
    decimals,
  );
}

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

export const getRandomFutureDateInSeconds = () => (
  new BigNumber(Date.now() + 1000000).div(900).ceil()
);
