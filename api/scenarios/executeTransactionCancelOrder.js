import {
  assetDataUtils,
  ContractWrappers,
  generatePseudoRandomSalt,
  orderHashUtils,
  signatureUtils,
  SignerType,
  BigNumber,
} from '0x.js';
import {
  Web3Wrapper,
} from '@0xproject/web3-wrapper';

import {
  PrintUtils,
} from './utils/printing';
import {
  providerEngine,
} from './utils/providerEngine';
import {
  DECIMALS,
  GANACHE_NETWORK_ID,
  NULL_ADDRESS,
  GAS_DEFAULT,
} from './utils/constants';
import {
  getRandomFutureDateInSeconds,
} from './utils/helpers';

/**
 * In this scenario a third party, called the sender,
 * submits the cancel operation on behalf of the maker.
 * This allows a sender to pay the gas for the maker. It can be combined with a custom sender
 * contract with additional business logic (e.g checking a whitelist). Or the sender
 * can choose how and when the transaction should be submitted, if at all.
 * The maker creates and signs the order. The signed order and cancelOrder parameters for the
 * execute transaction function call are signed by the maker as a proof of cancellation.
 */
export async function scenarioAsync() {
  PrintUtils.printScenario('Execute Transaction cancelOrderOrder');
  // Initialize the ContractWrappers, this provides helper functions around calling
  // 0x contracts as well as ERC20/ERC721 token contracts on the blockchain
  const contractWrappers = new ContractWrappers(providerEngine, { networkId: GANACHE_NETWORK_ID });
  // Initialize the Web3Wrapper, this provides helper functions around fetching
  // account information, balances, general contract logs
  const web3Wrapper = new Web3Wrapper(providerEngine);
  const [maker, taker, sender] = await web3Wrapper.getAvailableAddressesAsync();
  const feeRecipientAddress = sender;
  const zrxTokenAddress = contractWrappers.exchange.getZRXTokenAddress();
  const etherTokenAddress = contractWrappers.etherToken.getContractAddressIfExists();
  if (!etherTokenAddress) {
    throw new Error('Ether Token not found on this network');
  }
  const printUtils = new PrintUtils(
    web3Wrapper,
    contractWrappers,
    { maker, taker, sender },
    { WETH: etherTokenAddress, ZRX: zrxTokenAddress },
  );
  printUtils.printAccounts();

  // the amount the maker is selling of maker asset
  const makerAssetAmount = Web3Wrapper.toBaseUnitAmount(new BigNumber(5), DECIMALS);
  // the amount the maker wants of taker asset
  const takerAssetAmount = Web3Wrapper.toBaseUnitAmount(new BigNumber(0.1), DECIMALS);
  // the amount of fees the maker pays in ZRX
  const makerFee = Web3Wrapper.toBaseUnitAmount(new BigNumber(0.01), DECIMALS);
  // the amount of fees the taker pays in ZRX
  const takerFee = Web3Wrapper.toBaseUnitAmount(new BigNumber(0.01), DECIMALS);
  // 0x v2 uses hex encoded asset data strings
  // to encode all the information needed to identify an asset
  const makerAssetData = assetDataUtils.encodeERC20AssetData(zrxTokenAddress);
  const takerAssetData = assetDataUtils.encodeERC20AssetData(etherTokenAddress);

  // Approve the ERC20 Proxy to move ZRX for maker
  const makerZRXApprovalTxHash = await contractWrappers.erc20Token.setUnlimitedProxyAllowanceAsync(
    zrxTokenAddress,
    maker,
  );

  // Approve the ERC20 Proxy to move ZRX for taker
  const takerZRXApprovalTxHash = await contractWrappers.erc20Token.setUnlimitedProxyAllowanceAsync(
    zrxTokenAddress,
    taker,
  );

  // Approve the ERC20 Proxy to move WETH for taker
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
    ['Taker ZRX Approval', takerZRXApprovalTxHash],
    ['Taker WETH Approval', takerWETHApprovalTxHash],
    ['Taker WETH Deposit', takerWETHDepositTxHash],
  ]);

  // Set up the Order and fill it
  const randomExpiration = getRandomFutureDateInSeconds();

  // Create the order
  const orderWithoutExchangeAddress = {
    makerAddress: maker,
    takerAddress: NULL_ADDRESS,
    senderAddress: sender,
    feeRecipientAddress,
    expirationTimeSeconds: randomExpiration,
    salt: generatePseudoRandomSalt(),
    makerAssetAmount,
    takerAssetAmount,
    makerAssetData,
    takerAssetData,
    makerFee,
    takerFee,
  };

  const exchangeAddress = contractWrappers.exchange.getContractAddress();
  const order = {
    ...orderWithoutExchangeAddress,
    exchangeAddress,
  };
  printUtils.printOrder(order);

  // Print out the Balances and Allowances
  await printUtils.fetchAndPrintContractAllowancesAsync();
  await printUtils.fetchAndPrintContractBalancesAsync();

  // Generate the order hash and sign it
  const orderHashHex = orderHashUtils.getOrderHashHex(order);
  const signature = await signatureUtils.ecSignOrderHashAsync(
    providerEngine,
    orderHashHex,
    maker,
    SignerType.Default,
  );

  const signedOrder = {
    ...order,
    signature,
  };
  let orderInfo = await contractWrappers.exchange.getOrderInfoAsync(signedOrder);
  printUtils.printOrderInfos({ order: orderInfo });

  // The transaction encoder provides helpers in encoding 0x Exchange transactions to allow
  // a third party to submit the transaction. This operates in the context of the signer (maker)
  // rather then the context of the submitter (sender)
  const transactionEncoder = await contractWrappers.exchange.transactionEncoderAsync();
  // This is an ABI encoded function call that the taker wishes to perform
  // in this scenario it is a fillOrder
  const cancelData = transactionEncoder.cancelOrderTx(signedOrder);
  // Generate a random salt to mitigate replay attacks
  const makerCancelOrderTransactionSalt = generatePseudoRandomSalt();
  // The maker signs the operation data (cancelOrder) with the salt
  const executeTransactionHex = transactionEncoder.getTransactionHex(
    cancelData,
    makerCancelOrderTransactionSalt,
    maker,
  );
  const makerCancelOrderSignatureHex = await signatureUtils.ecSignOrderHashAsync(
    providerEngine,
    executeTransactionHex,
    maker,
    SignerType.Default,
  );
  // The sender submits this operation via executeTransaction
  // passing in the signature from the taker
  const txHash = await contractWrappers.exchange.executeTransactionAsync(
    makerCancelOrderTransactionSalt,
    maker,
    cancelData,
    makerCancelOrderSignatureHex,
    sender,
    {
      gasLimit: GAS_DEFAULT,
    },
  );
  const txReceipt = await web3Wrapper.awaitTransactionMinedAsync(txHash);
  printUtils.printTransaction('Execute Transaction cancelOrderOrder', txReceipt, [['orderHash', orderHashHex]]);

  orderInfo = await contractWrappers.exchange.getOrderInfoAsync(signedOrder);
  printUtils.printOrderInfos({ order: orderInfo });

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
