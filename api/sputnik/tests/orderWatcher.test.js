/* this test should never be stopped during executing */
import {
  spawn,
} from 'child_process';
import chai from 'chai';
import {
  signatureUtils,
  ContractWrappers,
  orderHashUtils,
  BigNumber,
} from '0x.js';
import {
  generatePseudoRandomSalt,
} from '@0x/order-utils';
import {
  Web3Wrapper,
} from '@0x/web3-wrapper';
import {
  redisClient,
} from 'redisClient';
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
} from '../../apiServer/test/utils';

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
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
const networkId = 50;
const ordersHashes = {
  hashes: [],
};
const contractAddresses = GANACHE_CONTRACT_ADDRESSES;
const createOrder = (
  makerAddress,
  makerAssetAmount,
  takerAssetAmount,
) => (
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
function startOrderWatcher() {
  const cwd = process.cwd();
  const child = spawn(
    'babel-node',
    ['sputnik/orderWatcher'],
    {
      cwd,
      shell: true,
      env: {
        ...process.env,
        NODE_ENV: 'test',
        DASHBOARD_PARENT: 'true',
        ETH_NETWORKS: 'test',
      },
    },
  );
  return () => {
    child.kill('SIGINT');
  };
}
const stopOrderWatcher = startOrderWatcher();

describe('orderWatcher events', () => {
  before(async () => {
    const web3Wrapper = new Web3Wrapper(web3ProviderEngine);
    const [makerAddress, takerAddress] = await web3Wrapper.getAvailableAddressesAsync();
    const contractWrappers = new ContractWrappers(
      web3ProviderEngine,
      {
        networkId,
        contractAddresses,
      },
    );
    /* deposit 0.05 WETH before tests */
    await contractWrappers.etherToken.depositAsync(
      contractAddresses.etherToken,
      toBaseUnit(0.05, 18),
      takerAddress,
    );
    await contractWrappers.etherToken.depositAsync(
      contractAddresses.etherToken,
      toBaseUnit(0.05, 18),
      makerAddress,
    );
    /* set allowances */
    await contractWrappers.erc20Token.setUnlimitedProxyAllowanceAsync(
      contractAddresses.zrxToken,
      makerAddress,
    );
    await contractWrappers.erc20Token.setProxyAllowanceAsync(
      contractAddresses.etherToken,
      makerAddress,
      toBaseUnit(0.05, 18),
    );
    await contractWrappers.erc20Token.setUnlimitedProxyAllowanceAsync(
      contractAddresses.zrxToken,
      takerAddress,
    );
    await contractWrappers.erc20Token.setProxyAllowanceAsync(
      contractAddresses.etherToken,
      takerAddress,
      toBaseUnit(0.05, 18),
    );
    const zrxBalanceTaker = await contractWrappers.erc20Token.getBalanceAsync(
      contractAddresses.zrxToken,
      takerAddress,
    );
    const wethBalanceTaker = await contractWrappers.erc20Token.getBalanceAsync(
      contractAddresses.etherToken,
      takerAddress,
    );
    const zrxBalanceMaker = await contractWrappers.erc20Token.getBalanceAsync(
      contractAddresses.zrxToken,
      makerAddress,
    );
    const wethBalanceMaker = await contractWrappers.erc20Token.getBalanceAsync(
      contractAddresses.etherToken,
      makerAddress,
    );
    const zrxAllowanceTaker = await contractWrappers.erc20Token.getProxyAllowanceAsync(
      contractAddresses.zrxToken,
      takerAddress,
    );
    const wethAllowanceTaker = await contractWrappers.erc20Token.getProxyAllowanceAsync(
      contractAddresses.etherToken,
      takerAddress,
    );
    const zrxAllowanceMaker = await contractWrappers.erc20Token.getProxyAllowanceAsync(
      contractAddresses.zrxToken,
      makerAddress,
    );
    const wethAllowanceMaker = await contractWrappers.erc20Token.getProxyAllowanceAsync(
      contractAddresses.etherToken,
      makerAddress,
    );
    console.log(`ZRX maker balance: ${zrxBalanceMaker}`);
    console.log(`WETH maker balance: ${wethBalanceMaker}`);
    console.log(`ZRX taker balance: ${zrxBalanceTaker}`);
    console.log(`WETH taker balance: ${wethBalanceTaker}`);
    console.log(`ZRX maker allowance: ${zrxAllowanceMaker}`);
    console.log(`WETH maker allowance: ${wethAllowanceMaker}`);
    console.log(`ZRX taker allowance: ${zrxAllowanceTaker}`);
    console.log(`WETH taker allowance: ${wethAllowanceTaker}`);
  });

  after(async () => {
    /* message to delete orders from mongo and watcher */
    redisClient.publish('testingOrderWatcher', JSON.stringify(ordersHashes));
    delay(3000);
    stopOrderWatcher();
  });

  it('should fetch fully filled order with appropriate error and completedAt fields', async () => {
    const web3Wrapper = new Web3Wrapper(web3ProviderEngine);
    const [makerAddress, takerAddress] = await web3Wrapper.getAvailableAddressesAsync();
    /* ZRX */
    const makerAssetAmount = toBaseUnit(
      2,
      18,
    );
    /* WETH */
    const takerAssetAmount = toBaseUnit(
      0.005,
      18,
    );
    const contractWrappers = new ContractWrappers(
      web3ProviderEngine,
      {
        networkId,
        contractAddresses,
      },
    );
    const order = createOrder(
      makerAddress,
      makerAssetAmount,
      takerAssetAmount,
    );
    const signedOrder = await signatureUtils.ecSignOrderAsync(
      web3ProviderEngine,
      order,
      makerAddress,
    );
    const response = await request
      .post(`/v2/order?networkId=${networkId}`)
      .send(signedOrder);
    /* fully fill order */
    const txHash = await contractWrappers.exchange.fillOrderAsync(
      signedOrder,
      takerAssetAmount,
      takerAddress,
    );
    await web3Wrapper.awaitTransactionMinedAsync(txHash);
    const orderHash = orderHashUtils.getOrderHashHex(order);
    // need delay because watcher modify order not immediately
    await delay(3000);
    const fetchedOrder = await Order.findOne({
      orderHash,
    }, {
      _id: 0,
      networkId: 0,
      orderHash: 0,
    });
    /* push order hash to remove after all tests */
    ordersHashes.hashes.push(orderHash);
    console.log(`Error field: ${fetchedOrder.error}`);

    expect(response.statusCode).to.equal(201);
    expect(fetchedOrder.isValid).to.equal(false);
    expect(fetchedOrder.error).to.equal('ORDER_REMAINING_FILL_AMOUNT_ZERO');
    expect(fetchedOrder).to.have.property('completedAt');
  });

  it('should fetch partially filled order with correct remaining amount', async () => {
    const web3Wrapper = new Web3Wrapper(web3ProviderEngine);
    const [makerAddress, takerAddress] = await web3Wrapper.getAvailableAddressesAsync();
    /* ZRX */
    const makerAssetAmount = toBaseUnit(
      2,
      18,
    );
    /* WETH */
    const takerAssetAmount = toBaseUnit(
      0.005,
      18,
    );
    /* order partial amount to fill by taker */
    const orderPartialAmount = toBaseUnit(
      0.001,
      18,
    );
    const contractWrappers = new ContractWrappers(
      web3ProviderEngine,
      {
        networkId,
        contractAddresses,
      },
    );
    const order = createOrder(
      makerAddress,
      makerAssetAmount,
      takerAssetAmount,
    );
    const signedOrder = await signatureUtils.ecSignOrderAsync(
      web3ProviderEngine,
      order,
      makerAddress,
    );
    const response = await request
      .post(`/v2/order?networkId=${networkId}`)
      .send(signedOrder);
    const txHash = await contractWrappers.exchange.fillOrderAsync(
      signedOrder,
      orderPartialAmount,
      takerAddress,
    );
    await web3Wrapper.awaitTransactionMinedAsync(txHash);
    const orderHash = orderHashUtils.getOrderHashHex(order);
    // need delay because watcher modify order not immediately
    await delay(3000);
    const fetchedOrder = await Order.findOne({
      orderHash,
    }, {
      _id: 0,
      networkId: 0,
      orderHash: 0,
    });
    const takerAssetPrice = makerAssetAmount.div(takerAssetAmount);
    /* push order hash to remove after all tests */
    ordersHashes.hashes.push(orderHash);
    console.log(`Error field: ${fetchedOrder.error}`);

    expect(response.statusCode).to.equal(201);
    expect(fetchedOrder.isValid).to.equal(true);
    expect(+fetchedOrder.remainingFillableTakerAssetAmount).to.equal(
      takerAssetAmount.minus(orderPartialAmount).toNumber(),
    );
    expect(+fetchedOrder.remainingFillableMakerAssetAmount).to.equal(
      makerAssetAmount.minus(orderPartialAmount.times(takerAssetPrice)).toNumber(),
    );
  });

  it('should fetch order with insufficient maker balance error', async () => {
    const web3Wrapper = new Web3Wrapper(web3ProviderEngine);
    const [makerAddress, takerAddress] = await web3Wrapper.getAvailableAddressesAsync();
    /* ZRX */
    const makerAssetAmount = toBaseUnit(
      2,
      18,
    );
    /* WETH */
    const takerAssetAmount = toBaseUnit(
      0.005,
      18,
    );
    const contractWrappers = new ContractWrappers(
      web3ProviderEngine,
      {
        networkId,
        contractAddresses,
      },
    );
    const order = createOrder(
      makerAddress,
      makerAssetAmount,
      takerAssetAmount,
    );
    const signedOrder = await signatureUtils.ecSignOrderAsync(
      web3ProviderEngine,
      order,
      makerAddress,
    );
    const response = await request
      .post(`/v2/order?networkId=${networkId}`)
      .send(signedOrder);
    const zrxBalanceMaker = await contractWrappers.erc20Token.getBalanceAsync(
      contractAddresses.zrxToken,
      makerAddress,
    );
    const orderHash = orderHashUtils.getOrderHashHex(order);
    try {
      /* transfer all ZRX to another address */
      await contractWrappers.erc20Token.transferAsync(
        contractAddresses.zrxToken,
        makerAddress,
        takerAddress,
        zrxBalanceMaker,
      );
      // need delay because watcher modify order not immediately
      await delay(3000);
      const fetchedOrder = await Order.findOne({
        orderHash,
      }, {
        _id: 0,
        networkId: 0,
        orderHash: 0,
      });
      /* push order hash to remove after all tests */
      ordersHashes.hashes.push(orderHash);
      console.log(`Error field: ${fetchedOrder.error}`);

      expect(response.statusCode).to.equal(201);
      expect(fetchedOrder.error).to.equal('INSUFFICIENT_MAKER_BALANCE');
      expect(fetchedOrder.isValid).to.equal(false);
    } catch (e) {
      console.log(e);
    } finally {
      /* return all ZRX to owner */
      await contractWrappers.erc20Token.transferAsync(
        contractAddresses.zrxToken,
        takerAddress,
        makerAddress,
        zrxBalanceMaker,
      );
    }
  });

  it('should fetch order with insufficient maker fee balance error', async () => {
    /* in this test we have to use another token as a maker address because
      * in ZRX case fee will be charged from maker assetAmount
       * so we use WETH as makerAsset */
    const web3Wrapper = new Web3Wrapper(web3ProviderEngine);
    const [makerAddress, takerAddress] = await web3Wrapper.getAvailableAddressesAsync();
    /* WETH */
    const makerAssetAmount = toBaseUnit(
      0.005,
      18,
    );
    /* ZRX */
    const takerAssetAmount = toBaseUnit(
      2,
      18,
    );
    const contractWrappers = new ContractWrappers(
      web3ProviderEngine,
      {
        networkId,
        contractAddresses,
      },
    );
    const order = createOrder(
      makerAddress,
      makerAssetAmount,
      takerAssetAmount,
    );
    /* swap maker and taker */
    order.makerAssetData = '0xf47261b00000000000000000000000000b1ba0af832d7c05fd64161e0db78e85978e8082';
    order.takerAssetData = '0xf47261b0000000000000000000000000871dd7c2b4b25e1aa18728e9d5f2af4c4e431f5c';
    /* set some fee gt zero for testing */
    order.makerFee = '1000';
    const signedOrder = await signatureUtils.ecSignOrderAsync(
      web3ProviderEngine,
      order,
      makerAddress,
    );
    const response = await request
      .post(`/v2/order?networkId=${networkId}&isCustomConfig=${true}`)
      .send(signedOrder);
    const zrxBalanceMaker = await contractWrappers.erc20Token.getBalanceAsync(
      contractAddresses.zrxToken,
      makerAddress,
    );
    const orderHash = orderHashUtils.getOrderHashHex(order);
    try {
      /* transfer all ZRX to another address */
      await contractWrappers.erc20Token.transferAsync(
        contractAddresses.zrxToken,
        makerAddress,
        takerAddress,
        zrxBalanceMaker,
      );
      // need delay because watcher modify order not immediately
      await delay(3000);
      const fetchedOrder = await Order.findOne({
        orderHash,
      }, {
        _id: 0,
        networkId: 0,
        orderHash: 0,
      });
      /* push order hash to remove after all tests */
      ordersHashes.hashes.push(orderHash);
      console.log(`Error field: ${fetchedOrder.error}`);

      expect(response.statusCode).to.equal(201);
      expect(fetchedOrder.error).to.equal('INSUFFICIENT_MAKER_FEE_BALANCE');
      expect(fetchedOrder.isValid).to.equal(false);
    } catch (e) {
      console.log(e);
    } finally {
      /* return all ZRX to owner */
      await contractWrappers.erc20Token.transferAsync(
        contractAddresses.zrxToken,
        takerAddress,
        makerAddress,
        zrxBalanceMaker,
      );
    }
  });

  it('should fetch order with insufficient maker allowance error', async () => {
    const web3Wrapper = new Web3Wrapper(web3ProviderEngine);
    const [makerAddress] = await web3Wrapper.getAvailableAddressesAsync();
    /* ZRX */
    const makerAssetAmount = toBaseUnit(
      2,
      18,
    );
    /* WETH */
    const takerAssetAmount = toBaseUnit(
      0.005,
      18,
    );
    const contractWrappers = new ContractWrappers(
      web3ProviderEngine,
      {
        networkId,
        contractAddresses,
      },
    );
    const order = createOrder(
      makerAddress,
      makerAssetAmount,
      takerAssetAmount,
    );
    const signedOrder = await signatureUtils.ecSignOrderAsync(
      web3ProviderEngine,
      order,
      makerAddress,
    );
    const response = await request
      .post(`/v2/order?networkId=${networkId}`)
      .send(signedOrder);
    /* get current ZRX proxy allowance */
    const zrxProxyAllowance = await contractWrappers.erc20Token.getProxyAllowanceAsync(
      contractAddresses.zrxToken,
      makerAddress,
    );
    const orderHash = orderHashUtils.getOrderHashHex(order);
    try {
      /* set ZRX allowance to zero */
      await contractWrappers.erc20Token.setProxyAllowanceAsync(
        contractAddresses.zrxToken,
        makerAddress,
        new BigNumber(0),
      );
      // need delay because watcher modify order not immediately
      await delay(3000);
      const fetchedOrder = await Order.findOne({
        orderHash,
      }, {
        _id: 0,
        networkId: 0,
        orderHash: 0,
      });
      /* push order hash to remove after all tests */
      ordersHashes.hashes.push(orderHash);
      console.log(`Error field: ${fetchedOrder.error}`);

      expect(response.statusCode).to.equal(201);
      expect(fetchedOrder.error).to.equal('INSUFFICIENT_MAKER_ALLOWANCE');
      expect(fetchedOrder.isValid).to.equal(false);
    } catch (e) {
      console.log(e);
    } finally {
      /* set old ZRX allowance */
      await contractWrappers.erc20Token.setProxyAllowanceAsync(
        contractAddresses.zrxToken,
        makerAddress,
        zrxProxyAllowance,
      );
    }
  });

  it('should fetch order with insufficient maker fee allowance error', async () => {
    /* in this test we have to use another token as a maker address because
      * in ZRX case fee will be charged from maker assetAmount
       * so we use WETH as makerAsset */
    const web3Wrapper = new Web3Wrapper(web3ProviderEngine);
    const [makerAddress] = await web3Wrapper.getAvailableAddressesAsync();
    /* WETH */
    const makerAssetAmount = toBaseUnit(
      0.005,
      18,
    );
    /* ZRX */
    const takerAssetAmount = toBaseUnit(
      2,
      18,
    );
    const contractWrappers = new ContractWrappers(
      web3ProviderEngine,
      {
        networkId,
        contractAddresses,
      },
    );
    const order = createOrder(
      makerAddress,
      makerAssetAmount,
      takerAssetAmount,
    );
    /* swap maker and taker */
    order.makerAssetData = '0xf47261b00000000000000000000000000b1ba0af832d7c05fd64161e0db78e85978e8082';
    order.takerAssetData = '0xf47261b0000000000000000000000000871dd7c2b4b25e1aa18728e9d5f2af4c4e431f5c';
    /* set some fee gt zero for testing */
    order.makerFee = '1000';
    const signedOrder = await signatureUtils.ecSignOrderAsync(
      web3ProviderEngine,
      order,
      makerAddress,
    );
    const response = await request
      .post(`/v2/order?networkId=${networkId}&isCustomConfig=${true}`)
      .send(signedOrder);
    /* get current ZRX proxy allowance */
    const zrxProxyAllowance = await contractWrappers.erc20Token.getProxyAllowanceAsync(
      contractAddresses.zrxToken,
      makerAddress,
    );
    const orderHash = orderHashUtils.getOrderHashHex(order);
    try {
      /* set ZRX allowance to zero */
      await contractWrappers.erc20Token.setProxyAllowanceAsync(
        contractAddresses.zrxToken,
        makerAddress,
        new BigNumber(0),
      );
      // need delay because watcher modify order not immediately
      await delay(5000);
      const fetchedOrder = await Order.findOne({
        orderHash,
      }, {
        _id: 0,
        networkId: 0,
        orderHash: 0,
      });
      /* push order hash to remove after all tests */
      ordersHashes.hashes.push(orderHash);
      console.log(`Error field: ${fetchedOrder.error}`);

      expect(response.statusCode).to.equal(201);
      expect(fetchedOrder.error).to.equal('INSUFFICIENT_MAKER_FEE_ALLOWANCE');
      expect(fetchedOrder.isValid).to.equal(false);
    } catch (e) {
      console.log(e);
    } finally {
      /* set old ZRX allowance */
      await contractWrappers.erc20Token.setProxyAllowanceAsync(
        contractAddresses.zrxToken,
        makerAddress,
        zrxProxyAllowance,
      );
    }
  });

  it('should fetch order with order canceled error', async () => {
    const web3Wrapper = new Web3Wrapper(web3ProviderEngine);
    const [makerAddress] = await web3Wrapper.getAvailableAddressesAsync();
    /* ZRX */
    const makerAssetAmount = toBaseUnit(
      2,
      18,
    );
    /* WETH */
    const takerAssetAmount = toBaseUnit(
      0.005,
      18,
    );
    const contractWrappers = new ContractWrappers(
      web3ProviderEngine,
      {
        networkId,
        contractAddresses,
      },
    );
    const order = createOrder(
      makerAddress,
      makerAssetAmount,
      takerAssetAmount,
    );
    const signedOrder = await signatureUtils.ecSignOrderAsync(
      web3ProviderEngine,
      order,
      makerAddress,
    );
    const response = await request
      .post(`/v2/order?networkId=${networkId}`)
      .send(signedOrder);
    const txHash = await contractWrappers.exchange.cancelOrderAsync(
      signedOrder,
    );
    await web3Wrapper.awaitTransactionMinedAsync(txHash);
    const orderHash = orderHashUtils.getOrderHashHex(order);
    // need delay because watcher modify order not immediately
    await delay(3000);
    const fetchedOrder = await Order.findOne({
      orderHash,
    }, {
      _id: 0,
      networkId: 0,
      orderHash: 0,
    });
    /* push order hash to remove after all tests */
    ordersHashes.hashes.push(orderHash);
    console.log(`Error field: ${fetchedOrder.error}`);

    expect(response.statusCode).to.equal(201);
    expect(fetchedOrder.error).to.equal('ORDER_CANCELLED');
    expect(fetchedOrder.isValid).to.equal(false);
  });

  it('should fetch order with expired error', async () => {
    const web3Wrapper = new Web3Wrapper(web3ProviderEngine);
    const [makerAddress] = await web3Wrapper.getAvailableAddressesAsync();
    /* ZRX */
    const makerAssetAmount = toBaseUnit(
      2,
      18,
    );
    /* WETH */
    const takerAssetAmount = toBaseUnit(
      0.005,
      18,
    );
    const order = createOrder(
      makerAddress,
      makerAssetAmount,
      takerAssetAmount,
    );
    /* set order expiration in 5 seconds */
    order.expirationTimeSeconds = (Math.floor(+Date.now() / 1000) + 5).toString();
    const signedOrder = await signatureUtils.ecSignOrderAsync(
      web3ProviderEngine,
      order,
      makerAddress,
    );
    const response = await request
      .post(`/v2/order?networkId=${networkId}`)
      .send(signedOrder);
    /* wait 5 secs for expiration */
    await delay(5000);
    const orderHash = orderHashUtils.getOrderHashHex(order);
    // need delay because watcher modify order not immediately
    const fetchedOrder = await Order.findOne({
      orderHash,
    }, {
      _id: 0,
      networkId: 0,
      orderHash: 0,
    });
    /* push order hash to remove after all tests */
    ordersHashes.hashes.push(orderHash);
    console.log(`Error field: ${fetchedOrder.error}`);

    expect(response.statusCode).to.equal(201);
    expect(fetchedOrder.error).to.equal('ORDER_FILL_EXPIRED');
    expect(fetchedOrder.isValid).to.equal(false);
  });

  xit('should fetch order with rounding error', async () => {
    /* couldn't reproduce requires clarification */
    const web3Wrapper = new Web3Wrapper(web3ProviderEngine);
    const [makerAddress, takerAddress] = await web3Wrapper.getAvailableAddressesAsync();
    /* ZRX */
    const makerAssetAmount = toBaseUnit(
      0.1001,
      18,
    );
    /* WETH */
    const takerAssetAmount = toBaseUnit(
      0.0003,
      18,
    );
    const orderPartialAmount = toBaseUnit(
      0.0002,
      18,
    );
    const contractWrappers = new ContractWrappers(
      web3ProviderEngine,
      {
        networkId,
        contractAddresses,
      },
    );
    const order = createOrder(
      makerAddress,
      makerAssetAmount,
      takerAssetAmount,
    );
    const signedOrder = await signatureUtils.ecSignOrderAsync(
      web3ProviderEngine,
      order,
      makerAddress,
    );
    const response = await request
      .post(`/v2/order?networkId=${networkId}`)
      .send(signedOrder);
    const txHash = await contractWrappers.exchange.fillOrderAsync(
      signedOrder,
      orderPartialAmount,
      takerAddress,
    );
    await web3Wrapper.awaitTransactionMinedAsync(txHash);
    const orderHash = orderHashUtils.getOrderHashHex(order);
    // need delay because watcher modify order not immediately
    await delay(3000);
    const fetchedOrder = await Order.findOne({
      orderHash,
    }, {
      _id: 0,
      networkId: 0,
      orderHash: 0,
    });
    /* push order hash to remove after all tests */
    ordersHashes.hashes.push(orderHash);
    console.log(`Error field: ${fetchedOrder.error}`);

    expect(response.statusCode).to.equal(201);
  });
});
