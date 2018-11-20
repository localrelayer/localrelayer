import 'module-alias/register';
import {
  orderHashUtils,
} from '0x.js';
import {
  generatePseudoRandomSalt,
} from '@0x/order-utils';
import {
  NULL_ADDRESS,
  GANACHE_CONTRACT_ADDRESSES,
  getOrderConfig,
  generateRandomMakerAssetAmount,
  generateRandomTakerAssetAmount,
  getRandomFutureDateInSeconds,
  randomEthereumAddress,
} from 'utils';
import {
  Order,
} from 'db';


(() => {
  const ordersQty = 10;
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
    completedAt: () => new Date(+(new Date()) - Math.floor(Math.random() * 10000000000)),
  };
  const orders = Array(ordersQty).fill().map(
    () => {
      const order = (
        Object.keys(testData)
          .reduce(
            (acc, fieldName) => ({
              ...acc,
              [fieldName]: testData[fieldName](),
            }),
            {
              ...orderConfig,
              networkId: 50,
            },
          )
      );
      return {
        ...order,
        orderHash: orderHashUtils.getOrderHashHex(order),
      };
    },
  );
  console.log(orders);
  Order.collection.insertMany(orders, process.exit);
})();
