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
  PrintUtils,
} from './utils/printing';
import {
  providerEngine,
} from './utils/providerEngine';
import {
  DECIMALS,
  ZERO,
  NULL_ADDRESS,
  GAS_DEFAULT,
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
  PrintUtils.printScenario('Match Orders');
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
  const [leftMaker, rightMaker, matcherAccount] = await web3Wrapper.getAvailableAddressesAsync();
  const zrxTokenAddress = contractAddresses.zrxToken;
  const etherTokenAddress = contractAddresses.etherToken;
  if (!etherTokenAddress) {
    throw new Error('Ether Token not found on this network');
  }
  const printUtils = new PrintUtils(
    web3Wrapper,
    contractWrappers,
    { leftMaker, rightMaker, matcherAccount },
    { WETH: etherTokenAddress, ZRX: zrxTokenAddress },
  );
  printUtils.printAccounts();

  // the amount the maker is selling of maker asset
  const makerAssetAmount = Web3Wrapper.toBaseUnitAmount(new BigNumber(10), DECIMALS);
  // the amount the maker wants of taker asset
  const takerAssetAmount = Web3Wrapper.toBaseUnitAmount(new BigNumber(0.4), DECIMALS);
  // 0x v2 uses hex encoded asset data strings
  // to encode all the information needed to identify an asset
  const makerAssetData = assetDataUtils.encodeERC20AssetData(zrxTokenAddress);
  const takerAssetData = assetDataUtils.encodeERC20AssetData(etherTokenAddress);

  // Allow the 0x ERC20 Proxy to move ZRX on behalf of makerAccount
  const leftMakerZRXApprovalTxHash = await contractWrappers.erc20Token
    .setUnlimitedProxyAllowanceAsync(
      zrxTokenAddress,
      leftMaker,
    );
  // Approve the ERC20 Proxy to move ZRX for rightMaker
  const rightMakerZRXApprovalTxHash = await contractWrappers.erc20Token
    .setUnlimitedProxyAllowanceAsync(
      zrxTokenAddress,
      rightMaker,
    );

  // Approve the ERC20 Proxy to move ZRX for matcherAccount
  const matcherZRXApprovalTxHash = await contractWrappers.erc20Token
    .setUnlimitedProxyAllowanceAsync(
      zrxTokenAddress,
      matcherAccount,
    );

  // Approve the ERC20 Proxy to move WETH for rightMaker
  const rightMakerWETHApprovalTxHash = await contractWrappers.erc20Token
    .setUnlimitedProxyAllowanceAsync(
      etherTokenAddress,
      rightMaker,
    );

  // Convert ETH into WETH for taker by depositing ETH into the WETH contract
  const rightMakerWETHDepositTxHash = await contractWrappers.etherToken.depositAsync(
    etherTokenAddress,
    takerAssetAmount,
    rightMaker,
  );

  PrintUtils.printData('Setup', [
    ['Left Maker ZRX Approval', leftMakerZRXApprovalTxHash],
    ['Right Maker ZRX Approval', rightMakerZRXApprovalTxHash],
    ['Matcher Maker ZRX Approval', matcherZRXApprovalTxHash],
    ['Right Maker WETH Approval', rightMakerWETHApprovalTxHash],
    ['RIght Maker WETH Deposit', rightMakerWETHDepositTxHash],
  ]);

  // Set up the Order and fill it
  const randomExpiration = getRandomFutureDateInSeconds();
  const exchangeAddress = contractAddresses.exchange;

  // Create the order
  const leftOrder = {
    exchangeAddress,
    makerAddress: leftMaker,
    takerAddress: NULL_ADDRESS,
    senderAddress: NULL_ADDRESS,
    feeRecipientAddress: NULL_ADDRESS,
    expirationTimeSeconds: randomExpiration,
    salt: generatePseudoRandomSalt(),
    makerAssetAmount,
    takerAssetAmount,
    makerAssetData,
    takerAssetData,
    makerFee: ZERO,
    takerFee: ZERO,
  };
  PrintUtils.printData('Left Order', Object.entries(leftOrder));

  // Create the matched order
  const rightOrderTakerAssetAmount = Web3Wrapper.toBaseUnitAmount(
    new BigNumber(0.2),
    DECIMALS,
  );
  const rightOrder = {
    exchangeAddress,
    makerAddress: rightMaker,
    takerAddress: NULL_ADDRESS,
    senderAddress: NULL_ADDRESS,
    feeRecipientAddress: NULL_ADDRESS,
    expirationTimeSeconds: randomExpiration,
    salt: generatePseudoRandomSalt(),
    makerAssetAmount: leftOrder.takerAssetAmount,
    takerAssetAmount: rightOrderTakerAssetAmount,
    makerAssetData: leftOrder.takerAssetData,
    takerAssetData: leftOrder.makerAssetData,
    makerFee: ZERO,
    takerFee: ZERO,
  };
  PrintUtils.printData('Right Order', Object.entries(rightOrder));

  // Generate the order hash and sign it
  const leftOrderHashHex = orderHashUtils.getOrderHashHex(leftOrder);
  const leftOrderSignature = await signatureUtils.ecSignHashAsync(
    providerEngine,
    leftOrderHashHex,
    leftMaker,
  );
  const leftSignedOrder = { ...leftOrder, signature: leftOrderSignature };

  // Generate the order hash and sign it
  const rightOrderHashHex = orderHashUtils.getOrderHashHex(rightOrder);
  const rightOrderSignature = await signatureUtils.ecSignHashAsync(
    providerEngine,
    rightOrderHashHex,
    rightMaker,
  );
  const rightSignedOrder = { ...rightOrder, signature: rightOrderSignature };

  // Print out the Balances and Allowances
  await printUtils.fetchAndPrintContractAllowancesAsync();
  await printUtils.fetchAndPrintContractBalancesAsync();
  // Match the orders via 0x Exchange
  const txHash = await contractWrappers.exchange
    .matchOrdersAsync(leftSignedOrder, rightSignedOrder, matcherAccount, {
      gasLimit: GAS_DEFAULT,
    });

  const txReceipt = await web3Wrapper.awaitTransactionMinedAsync(txHash);
  printUtils.printTransaction('matchOrders', txReceipt, [
    ['left orderHash', leftOrderHashHex],
    ['right orderHash', rightOrderHashHex],
  ]);

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
