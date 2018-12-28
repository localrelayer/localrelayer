import '../../aliases';
import {
  OrderWatcher,
} from '@0x/order-watcher';
import {
  ExchangeContractErrs,
} from '@0x/types';
import {
  Order,
} from 'db';
import {
  redisClient,
} from 'redisClient';
import {
  createLogger,
} from 'logger';
import {
  initWeb3ProviderEngine,
  transformBigNumberOrder,
  clearOrderFields,
  clearOrderWithMetaFields,
  constructOrderRecord,
  ETH_NETWORKS_NAME_MAP,
  GANACHE_CONTRACT_ADDRESSES,
  validateOrderAmount,
} from 'utils';

import {
  BigNumber,
} from '0x.js';
import {
  collectTradingInfo,
} from '../collect';


const logger = createLogger(
  'orderWatcher',
  process.env.LOG_LEVEL || 'silly',
  (
    require.main === module
    && process.env.DASHBOARD_PARENT !== 'true'
  ),
);
logger.debug('orderWatcher logger was created');

const FILL_ERROR = ExchangeContractErrs.OrderRemainingFillAmountZero;
const CLOSE_ORDER_ERRORS = [
  ExchangeContractErrs.OrderFillExpired,
  ExchangeContractErrs.OrderCancelled,
  ExchangeContractErrs.OrderRemainingFillAmountZero,
  ExchangeContractErrs.OrderFillRoundingError,
];

async function watcherCreator(networkId) {
  const web3ProviderEngine = initWeb3ProviderEngine(networkId);
  const orderWatcher = new OrderWatcher(
    web3ProviderEngine,
    networkId,
    networkId === 50 ? GANACHE_CONTRACT_ADDRESSES : undefined,
  );

  orderWatcher.subscribe(async (err, orderState) => {
    console.log('=============');
    console.log(err);
    console.log(orderState);
    console.log('=============');
    if (!err && orderState) {
      const {
        isValid,
        orderHash,
      } = orderState;
      const order = await Order.findOne({
        orderHash,
      });

      if (isValid) {
        const {
          remainingFillableMakerAssetAmount,
          remainingFillableTakerAssetAmount,
          filledTakerAssetAmount,
        } = orderState.orderRelevantState;

        if (!(new BigNumber(filledTakerAssetAmount).eq(order.filledTakerAssetAmount))) {
          order.lastFilledAt = new Date();
        }

        const {
          isMinAmountValid,
          isMaxAmountValid,
        } = await validateOrderAmount(order);

        const diffFilledAmount = !(new BigNumber(filledTakerAssetAmount)
          .eq(order.filledTakerAssetAmount));
        const diffRemainingFillableMakerAmount = !(new BigNumber(remainingFillableMakerAssetAmount)
          .eq(order.remainingFillableMakerAssetAmount));
        const diffRemainingFillableTakerAmount = !(new BigNumber(remainingFillableTakerAssetAmount)
          .eq(order.remainingFillableTakerAssetAmount));


        if (
          !isMinAmountValid
          || !isMaxAmountValid
        ) {
          logger.debug('ORDER INVALIDATED BECAUSE OF AMOUNT');
          order.error = !isMinAmountValid ? 'ORDER_TOO_SMALL_AMOUNT' : 'ORDER_TOO_BIG_AMOUNT';
          order.isShadowed = false;
          order.isValid = false;

          order.remainingFillableMakerAssetAmount = remainingFillableMakerAssetAmount;
          order.remainingFillableTakerAssetAmount = remainingFillableTakerAssetAmount;
          order.filledTakerAssetAmount = filledTakerAssetAmount;
          await order.save();
          /* do not spread plainOrder object, it will emit lot of extra keys */
          const plainOrder = order.toObject();
          redisClient.publish(
            'orders',
            JSON.stringify(
              constructOrderRecord(
                clearOrderWithMetaFields(plainOrder),
              ),
            ),
          );
          orderWatcher.removeOrder(orderHash);
        } else if (
          diffFilledAmount
          || diffRemainingFillableMakerAmount
          || diffRemainingFillableTakerAmount
          || order.isShadowed
          || !order.isValid
        ) {
          order.isShadowed = false;
          order.isValid = true;

          order.remainingFillableMakerAssetAmount = remainingFillableMakerAssetAmount;
          order.remainingFillableTakerAssetAmount = remainingFillableTakerAssetAmount;
          order.filledTakerAssetAmount = new BigNumber(filledTakerAssetAmount);
          await order.save();
          /* do not spread plainOrder object, it will emit lot of extra keys */
          const plainOrder = order.toObject();
          redisClient.publish(
            'orders',
            JSON.stringify(
              constructOrderRecord(
                clearOrderWithMetaFields(plainOrder),
              ),
            ),
          );
        }
      } else {
        order.isValid = false;
        const { error } = orderState;
        order.error = error;
        order.isShadowed = !CLOSE_ORDER_ERRORS.includes(error);
        if (CLOSE_ORDER_ERRORS.includes(error)) {
          order.completedAt = new Date().toISOString();
        }

        if (error === FILL_ERROR) {
          order.remainingFillableMakerAssetAmount = '0';
          order.remainingFillableTakerAssetAmount = '0';
          order.filledTakerAssetAmount = order.takerAssetAmount;
          order.lastFilledAt = new Date();
          try {
            const {
              tradingInfoRedisKeyMakerTaker,
              tradingInfoRedisKeyTakerMaker,
            } = await collectTradingInfo(order, logger);

            redisClient.publish(
              'tradingInfo',
              `${tradingInfoRedisKeyMakerTaker}^${tradingInfoRedisKeyTakerMaker}`,
            );
          } catch (e) {
            logger.error(e);
          }
        }
        /* do not spread plainOrder object, it will emit lot of extra keys */
        const plainOrder = order.toObject();
        redisClient.publish(
          'orders',
          JSON.stringify(
            constructOrderRecord(
              clearOrderWithMetaFields(plainOrder),
            ),
          ),
        );
        await order.save();
        if (
          !order.isValid
          && !order.isShadowed
        ) {
          orderWatcher.removeOrder(orderHash);
        }
      }
    }
  });

  const orders = await Order.find({
    networkId,
    $and: [
      {
        $or: [
          {
            isValid: true,
          },
          {
            isValid: false,
            isShadowed: true,
          },
        ],
      },
    ],
  });
  orders.forEach((order) => {
    orderWatcher.addOrderAsync(
      transformBigNumberOrder(order.toObject()),
    );
  });

  return orderWatcher;
}

(async () => {
  const networks = (
    (process.env.ETH_NETWORKS || 'main,kovan,test').split(',')
  ).map(networkName => ETH_NETWORKS_NAME_MAP[networkName]);
  const watchers = (
    await Promise.all(
      networks.map(networkId => watcherCreator(networkId)),
    )
  ).reduce((acc, watcher, index) => ({
    ...acc,
    [networks[index]]: watcher,
  }), {});

  const redisSub = redisClient.duplicate();
  redisSub.on('message', async (channel, message) => {
    redisClient.publish('orders', message);
    const {
      order: rawOrder,
      metaData,
    } = JSON.parse(message);
    const order = clearOrderFields(rawOrder);
    await watchers[metaData.networkId].addOrderAsync(
      transformBigNumberOrder(order),
    );
  });

  const redisTestSub = redisClient.duplicate();
  redisTestSub.on('message', async (channel, message) => {
    const { hashes } = JSON.parse(message);
    await Order.deleteMany({
      $or: (
        hashes.reduce((acc, orderHash) => ([
          ...acc,
          {
            orderHash,
          },
        ]), [])
      ),
    });
    hashes.forEach((hash) => {
      /* for testing network ID always 50 */
      watchers[50].removeOrder(hash);
    });
  });
  redisSub.subscribe('orderWatcher');
  redisTestSub.subscribe('testingOrderWatcher');
})();
