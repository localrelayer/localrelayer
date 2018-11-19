import chai from 'chai';
import {
  signatureUtils,
  ContractWrappers,
  assetDataUtils,
  orderHashUtils,
} from '0x.js';
import {
  generatePseudoRandomSalt,
} from '@0x/order-utils';
import {
  Web3Wrapper,
} from '@0x/web3-wrapper';
import {
  Order,
} from 'db';

import {
  GANACHE_CONTRACT_ADDRESSES,
  NULL_ADDRESS,
  toBaseUnit,
  getOrderConfig,
  randomEthereumAddress,
  generateRandomMakerAssetAmount,
  generateRandomTakerAssetAmount,
  getRandomFutureDateInSeconds,
} from 'utils';
import {
  request,
  initTestProvider,
} from './utils';


const { expect } = chai;

const web3ProviderEngine = initTestProvider();
const orderConfig = getOrderConfig();
const testData = {
  makerAddress: () => randomEthereumAddress(),
  takerAddress: () => NULL_ADDRESS,
  makerAssetAmount: () => generateRandomMakerAssetAmount(18).toString(),
  takerAssetAmount: () => generateRandomTakerAssetAmount(18).toString(),
  makerAssetData: () => '0xf47261b0000000000000000000000000871dd7c2b4b25e1aa18728e9d5f2af4c4e431f5c', /* ZRX */
  takerAssetData: () => '0xf47261b00000000000000000000000000b1ba0af832d7c05fd64161e0db78e85978e8082', /* WETH */
  exchangeAddress: () => GANACHE_CONTRACT_ADDRESSES.exchange,
  salt: () => generatePseudoRandomSalt().toString(),
  expirationTimeSeconds: () => getRandomFutureDateInSeconds().toString(),
  signature: () => randomEthereumAddress(),
};
const requiredFields = Object.keys({
  ...orderConfig,
  ...testData,
});


describe('create a new order with correct data and fill', () => {
  it('should response 200', async () => {
    const networkId = 50;
    const web3Wrapper = new Web3Wrapper(web3ProviderEngine);
    const [makerAddress, takerAddress] = await web3Wrapper.getAvailableAddressesAsync();
    /* ZRX */
    const makerAssetAmount = toBaseUnit(
      2,
      18,
    );
    /* WETH */
    const takerAssetAmount = toBaseUnit(
      2,
      18,
    );
    const contractAddresses = GANACHE_CONTRACT_ADDRESSES;
    const contractWrappers = new ContractWrappers(
      web3ProviderEngine,
      {
        networkId,
        contractAddresses,
      },
    );

    await contractWrappers.erc20Token.setUnlimitedProxyAllowanceAsync(
      contractAddresses.zrxToken,
      makerAddress,
    );
    await contractWrappers.erc20Token.setUnlimitedProxyAllowanceAsync(
      contractAddresses.etherToken,
      takerAddress,
    );
    const order = (
      requiredFields
        .reduce((acc, fieldName) => ({
          [fieldName]: (
            orderConfig[fieldName]
            || testData[fieldName]()
          ),
          ...acc,
        }), {
          makerAddress,
          makerAssetAmount,
          takerAssetAmount,
        })
    );
    const orderHash = orderHashUtils.getOrderHashHex(order);
    const signedOrder = await signatureUtils.ecSignOrderAsync(
      web3ProviderEngine,
      order,
      makerAddress,
    );
    console.log(signedOrder);

    const response = await request
      .post(`/v2/order?networkId=${networkId}`)
      .send(signedOrder);
    const orderFetched = await Order.findOne({
      orderHash,
    }, {
      _id: 0,
      networkId: 0,
      orderHash: 0,
    });

    const etherTokenAddress = contractAddresses.etherToken;
    const takerWETHDepositTxHash = await contractWrappers.etherToken.depositAsync(
      etherTokenAddress,
      takerAssetAmount,
      takerAddress,
    );
    console.log(takerWETHDepositTxHash);

    const decMakerAssetData = assetDataUtils.decodeERC20AssetData(signedOrder.makerAssetData);
    const decTakerAssetData = assetDataUtils.decodeERC20AssetData(signedOrder.takerAssetData);

    const zrxBalance = await contractWrappers.erc20Token.getBalanceAsync(
      decMakerAssetData.tokenAddress,
      takerAddress,
    );
    const wethBalance = await contractWrappers.erc20Token.getBalanceAsync(
      decTakerAssetData.tokenAddress,
      takerAddress,
    );
    console.log(`ZRX: ${zrxBalance}`);
    console.log(`WETH: ${wethBalance}`);

    const txHash = await contractWrappers.exchange.fillOrderAsync(
      signedOrder,
      takerAssetAmount,
      takerAddress,
    );
    const txReceipt = await web3Wrapper.awaitTransactionMinedAsync(txHash);
    console.log(txReceipt);
    expect(response.statusCode).to.equal(201);
  });
});
