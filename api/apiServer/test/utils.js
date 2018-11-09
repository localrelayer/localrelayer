import supertest from 'supertest';
import {
  assetDataUtils,
  generatePseudoRandomSalt,
} from '0x.js';
import {
  Web3Wrapper,
} from '@0xproject/web3-wrapper';

import {
  app,
} from '..';
import config from '../../config';
import BigNumber from '../../BigNumber';

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
  const randomExpiration = BigNumber(Date.now() + 1000000).div(900).ceil();
  const exchangeAddress = '0x48bacb9266a570d521063ef5dd96e61686dbe788';
  const orderConfigRequest = {
    exchangeAddress,
    makerAddress: maker,
    takerAddress: '0x0000000000000000000000000000000000000000',
    expirationTimeSeconds: expirationTime ? BigNumber(expirationTime) : randomExpiration,
    makerAssetAmount: makerAssetAmount
      ? Web3Wrapper.toBaseUnitAmount(BigNumber(makerAssetAmount), 18)
      : Web3Wrapper.toBaseUnitAmount(BigNumber(5), 18),
    takerAssetAmount: takerAssetAmount
      ? Web3Wrapper.toBaseUnitAmount(BigNumber(takerAssetAmount), 18)
      : Web3Wrapper.toBaseUnitAmount(BigNumber(0.1), 18),
    makerAssetData,
    takerAssetData,
  };
  const orderConfig = {
    senderAddress: '0x0000000000000000000000000000000000000000',
    feeRecipientAddress: '0x0000000000000000000000000000000000000000',
    makerFee: BigNumber(0),
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

export function generateRandomMakerAssetAmount() {
  return ((Math.random() * 100) + 10).toFixed(6);
}

export function generateRandomTakerAssetAmount() {
  return ((Math.random() * 0.3) + 0.03).toFixed(6);
}
