import {
  assetDataUtils,
  BigNumber,
  ContractWrappers,
  generatePseudoRandomSalt,
  orderHashUtils,
  signatureUtils,
} from '0x.js';
import {
  Web3Wrapper,
} from '@0x/web3-wrapper';
import {
  HttpClient,
} from '@0x/connect';
import {
  PrintUtils,
} from './utils/printing';
import {
  providerEngine,
} from './utils/providerEngine';
import {
  DECIMALS,
  GAS_DEFAULT,
  GANACHE_NETWORK_ID,
  NULL_ADDRESS,
} from './utils/constants';
import {
  getContractAddressesForNetwork,
  getContractWrappersConfig,
} from './utils/contracts';
import {
  getRandomFutureDateInSeconds,
} from './utils/helpers';
import {
  NETWORK_CONFIGS,
} from './utils/configs';

export async function scenarioAsync() {
  PrintUtils.printScenario('Fill Order Standard Relayer API');
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
  printUtils.printAccounts();

  const takerAssetData = assetDataUtils.encodeERC20AssetData(zrxTokenAddress);
  const makerAssetData = assetDataUtils.encodeERC20AssetData(etherTokenAddress);
  // the amount the maker is selling of maker asset
  const makerAssetAmount = Web3Wrapper.toBaseUnitAmount(new BigNumber(0.005), DECIMALS);
  // the amount the maker wants of taker asset
  const takerAssetAmount = Web3Wrapper.toBaseUnitAmount(new BigNumber(0.01), DECIMALS);


  // Allow the 0x ERC20 Proxy to move ZRX on behalf of makerAccount
  const makerZRXApprovalTxHash = await contractWrappers.erc20Token.setUnlimitedProxyAllowanceAsync(
    zrxTokenAddress,
    maker,
  );

  // Allow the 0x ERC20 Proxy to move WETH on behalf of takerAccount
  const takerWETHApprovalTxHash = await contractWrappers.erc20Token.setUnlimitedProxyAllowanceAsync(
    etherTokenAddress,
    taker,
  );

  // Convert ETH into WETH for taker by depositing ETH into the WETH contract
  const takerWETHDepositTxHash = await contractWrappers.etherToken.depositAsync(
    etherTokenAddress,
    takerAssetAmount,
    taker,
  );

  PrintUtils.printData('Setup', [
    ['Maker ZRX Approval', makerZRXApprovalTxHash],
    ['Taker WETH Approval', takerWETHApprovalTxHash],
    ['Taker WETH Deposit', takerWETHDepositTxHash],
  ]);

  // Initialize the Standard Relayer API client
  const httpClient = new HttpClient('http://localhost:5001/v2/');

  // Generate and expiration time and find the exchange smart contract address
  const randomExpiration = getRandomFutureDateInSeconds();
  const exchangeAddress = contractAddresses.exchange;

  // Ask the relayer about the parameters they require for the order
  const orderConfigRequest = {
    exchangeAddress,
    makerAddress: maker,
    takerAddress: NULL_ADDRESS,
    expirationTimeSeconds: randomExpiration,
    makerAssetAmount,
    takerAssetAmount,
    makerAssetData,
    takerAssetData,
  };
  const orderConfig = await httpClient.getOrderConfigAsync(orderConfigRequest, {
    networkId: GANACHE_NETWORK_ID,
  });

  // Create the order
  const order = {
    salt: generatePseudoRandomSalt(),
    ...orderConfigRequest,
    ...orderConfig,
  };

  await printUtils.fetchAndPrintContractBalancesAsync();
  // Generate the order hash and sign it
  const orderHashHex = orderHashUtils.getOrderHashHex(order);
  const signature = await signatureUtils.ecSignHashAsync(
    providerEngine,
    orderHashHex,
    maker,
  );
  const signedOrder = { ...order, signature };

  // Validate this order
  await contractWrappers.exchange.validateOrderFillableOrThrowAsync(signedOrder);
  // Submit the order to the SRA Endpoint
  await httpClient.submitOrderAsync(signedOrder, { networkId: GANACHE_NETWORK_ID });
  // Taker queries the Orderbook from the Relayer
  const orderbookRequest = { baseAssetData: makerAssetData, quoteAssetData: takerAssetData };
  const response = await httpClient.getOrderbookAsync(
    orderbookRequest,
    {
      networkId: GANACHE_NETWORK_ID,
    },
  );
  if (response.asks.total === 0) {
    throw new Error('No orders found on the SRA Endpoint');
  }
  // if we don't remove full filled order from global scope,
  // we should get last added order here not 1st every time
  const sraOrder = response.asks.records[response.asks.records.length - 1].order;
  printUtils.printOrder(sraOrder);
  // Validate the order is Fillable given the maker and taker balances
  await contractWrappers.exchange.validateFillOrderThrowIfInvalidAsync(
    sraOrder,
    takerAssetAmount,
    taker,
  );
  // Fill the Order via 0x Exchange contract
  const txHash = await contractWrappers.exchange.fillOrderAsync(sraOrder, takerAssetAmount, taker, {
    gasLimit: GAS_DEFAULT,
  });
  const txReceipt = await web3Wrapper.awaitTransactionMinedAsync(txHash);
  printUtils.printTransaction('fillOrder', txReceipt, [['orderHash', orderHashHex]]);

  // Print the Balances
  await printUtils.fetchAndPrintContractBalancesAsync();

  // Stop the Provider Engine
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
