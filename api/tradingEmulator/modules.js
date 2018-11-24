import {
  assetDataUtils,
  BigNumber,
  generatePseudoRandomSalt,
  signatureUtils,
} from '0x.js';
import {
  Web3Wrapper,
} from '@0x/web3-wrapper';
import {
  contractWrappers,
  contractAddresses,
  httpClient,
  providerEngine,
  web3Wrapper,
} from './connector';
import {
  getRandomFutureDateInSeconds,
} from '../scenarios/utils/helpers';
import {
  NULL_ADDRESS,
  GAS_DEFAULT,
} from './constants';
import Config from './.config';
import {
  loadBalancesForPair,
  awaitTransactionsMined,
  generateRandomNumber,
  reduce,
} from './helpers';
import {
  logger,
} from './emulatorLogger';

// ALLOWANCE AND DEPOSIT
// Gives unlimited allowance and deposity all ETH to WETH (except 1 ETH for gas)

export const prepareAccounts = async ({
  assetA,
  assetB,
  addresses,
}) => {
  const etherTokenAddress = contractAddresses.etherToken;

  await Promise.all(addresses.map(async (address) => {
    const ethBalance = await web3Wrapper.getBalanceInWeiAsync(address);
    const oneWeth = Web3Wrapper.toBaseUnitAmount(new BigNumber(1), 18);

    const assetAAllowanceTxHash = await contractWrappers.erc20Token.setUnlimitedProxyAllowanceAsync(
      assetA.tokenAddress,
      address,
    );
    const assetBAllowanceTxHash = await contractWrappers.erc20Token.setUnlimitedProxyAllowanceAsync(
      assetB.tokenAddress,
      address,
    );

    if (ethBalance.gte(oneWeth)) {
      const depositTxHash = await contractWrappers.etherToken.depositAsync(
        etherTokenAddress,
        ethBalance.minus(oneWeth),
        address,
      );
      web3Wrapper.awaitTransactionMinedAsync(depositTxHash);
    }

    await awaitTransactionsMined([
      assetAAllowanceTxHash,
      assetBAllowanceTxHash,
    ], web3Wrapper);
  }));
};

const findAddressWithBalance = (
  balances,
  addresses,
  orderType,
  amount = 0,
) => reduce(addresses, ((acc, cur) => {
  const { assetABalance, assetBBalance } = balances[cur];
  if (new BigNumber(
    orderType === 'asks' ? assetABalance : assetBBalance,
  ).gt(amount)) {
    acc = {
      address: cur,
      assetABalance,
      assetBBalance,
    };
  }
  return acc;
}), {});

const chooseRandomOrder = (orders) => {
  const filtered = orders
    .filter(o => o.taker);
  return filtered[Math.floor(Math.random() * orders.length)];
};

const submitOrder = async ({
  pair,
  addresses,
}) => {
  const balances = await loadBalancesForPair(pair, addresses);
  const {
    assetA,
    assetB,
  } = pair;

  let makerAssetData;
  let takerAssetData;
  let makerAssetAmount;
  let takerAssetAmount;

  // Decide with order type by random
  const makerOrderType = Math.random() >= 0.5 ? 'asks' : 'bids';
  const takerOrderType = makerOrderType === 'asks' ? 'bids' : 'asks';

  // Amounts are hardcoded to 1/10 of first found non zero balance

  const maker = findAddressWithBalance(balances, addresses, makerOrderType);
  const potentialTaker = findAddressWithBalance(balances, addresses, takerOrderType);

  if (makerOrderType === 'asks') {
    makerAssetData = assetDataUtils.encodeERC20AssetData(assetA.tokenAddress);
    takerAssetData = assetDataUtils.encodeERC20AssetData(assetB.tokenAddress);
    makerAssetAmount = generateRandomNumber(0, new BigNumber(maker.assetABalance).div(10));
    takerAssetAmount = generateRandomNumber(0, new BigNumber(potentialTaker.assetBBalance).div(10));
  } else {
    makerAssetData = assetDataUtils.encodeERC20AssetData(assetB.tokenAddress);
    takerAssetData = assetDataUtils.encodeERC20AssetData(assetA.tokenAddress);
    makerAssetAmount = generateRandomNumber(0, new BigNumber(maker.assetBBalance).div(10));
    takerAssetAmount = generateRandomNumber(0, new BigNumber(potentialTaker.assetABalance).div(10));
  }

  const exchangeAddress = contractAddresses.exchange;
  const randomExpiration = getRandomFutureDateInSeconds();

  // Ask the relayer about the parameters they require for the order
  const orderConfigRequest = {
    exchangeAddress,
    makerAddress: maker.address,
    takerAddress: NULL_ADDRESS,
    expirationTimeSeconds: randomExpiration,
    makerAssetAmount,
    takerAssetAmount,
    makerAssetData,
    takerAssetData,
  };

  const orderConfig = await httpClient.getOrderConfigAsync(orderConfigRequest, {
    networkId: Config.network.networkId,
  });

  const order = {
    salt: generatePseudoRandomSalt(),
    ...orderConfigRequest,
    ...orderConfig,
  };

  const signedOrder = await signatureUtils.ecSignOrderAsync(
    providerEngine,
    order,
    maker.address,
  );
  // Validate this order
  try {
    await contractWrappers.exchange.validateOrderFillableOrThrowAsync(signedOrder);
    // Submit the order to the SRA Endpoint
    await httpClient.submitOrderAsync(
      signedOrder,
      {
        networkId: Config.network.networkId,
      },
    );
    logger.debug('Order created');
  } catch (e) {
    logger.error("Created order isn't valid %s", e.message);
  }
};

const fillOrder = async ({
  pair,
  addresses,
}) => {
  const balances = await loadBalancesForPair(pair, addresses);
  const {
    assetA,
    assetB,
  } = pair;

  const orderbookRequest = {
    baseAssetData: assetDataUtils.encodeERC20AssetData(assetA.tokenAddress),
    quoteAssetData: assetDataUtils.encodeERC20AssetData(assetB.tokenAddress),
  };

  const orderbookResponse = await httpClient.getOrderbookAsync(
    orderbookRequest,
    {
      networkId: Config.network.networkId,
    },
  );

  // Randomly choose which order we'll check first
  // const takerOrderType = makerOrderType === 'asks' ? 'bids' : 'asks';

  logger.debug(`ASKS: ${orderbookResponse.asks.records.length}`);
  logger.debug(`BIDS: ${orderbookResponse.bids.records.length}`);

  const askSRAOrder = orderbookResponse.asks.records.reduce((acc, cur) => {
    const { address: taker } = findAddressWithBalance(
      balances,
      addresses,
      'bids',
      cur.order.takerAssetAmount,
    );
    return {
      taker,
      takerAssetAmount: cur.order.takerAssetAmount,
      order: cur.order,
    };
  }, {});

  const bidSRAOrder = orderbookResponse.bids.records.reduce((acc, cur) => {
    const { address: taker } = findAddressWithBalance(
      balances,
      addresses,
      'asks',
      cur.order.takerAssetAmount,
    );
    return {
      taker,
      takerAssetAmount: cur.order.takerAssetAmount,
      order: cur.order,
    };
  }, {});

  const sraOrder = chooseRandomOrder([askSRAOrder, bidSRAOrder]);

  if (!sraOrder) {
    logger.debug('NO ORDERS TO FILL');
    return;
  }

  try {
    // Validate the order is Fillable given the maker and taker balances
    await contractWrappers.exchange.validateFillOrderThrowIfInvalidAsync(
      sraOrder.order,
      sraOrder.takerAssetAmount,
      sraOrder.taker,
    );

    // Fill the Order via 0x Exchange contract
    const txHash = await contractWrappers.exchange.fillOrderAsync(
      sraOrder.order,
      sraOrder.takerAssetAmount,
      sraOrder.taker,
      {
        gasLimit: GAS_DEFAULT,
      },
    );

    await web3Wrapper.awaitTransactionMinedAsync(txHash);
    logger.debug(`SUCCESS FILL ${txHash}`);
  } catch (e) {
    logger.error("Order isn't valid %s", e.message);
  }
};

export const orderSubmitter = async ({
  orderConfig,
  quantity,
}) => {
  logger.debug(`CREATING ${quantity} NEW ORDERS`);
  Array(quantity).fill().map(() => submitOrder(orderConfig));
};

export const orderFiller = async ({
  orderConfig,
  quantity,
}) => {
  logger.debug(`LOOKING TO FILL ${quantity} ORDERS`);
  Array(quantity).fill().map(() => fillOrder(orderConfig));
};
