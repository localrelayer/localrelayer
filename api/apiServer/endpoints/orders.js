import {
  BigNumber,
} from '0x.js';

import {
  logger,
} from 'apiLogger';
import {
  Order,
} from 'db';
import {
  clearObjectKeys,
  constructOrderRecord,
} from 'utils';


const sort = (a, b) => {
  const aPrice = new BigNumber(a.takerAssetAmount).div(a.makerAssetAmount);
  const bPrice = new BigNumber(b.takerAssetAmount).div(b.makerAssetAmount);
  return aPrice - bPrice;
};

const queryArgs = [
  'makerAssetProxyId',
  'takerAssetProxyId',
  'makerAssetAddress',
  'takerAssetAddress',
  'exchangeAddress',
  'senderAddress',
  'makerAssetData',
  'takerAssetData',
  'traderAssetData',
  'makerAddress',
  'takerAddress',
  'traderAddress',
  'feeRecipientAddress',
  'networkId',
  'page',
  'perPage',
];

export function createOrdersEndpoint(standardRelayerApi) {
  standardRelayerApi.get('/orders', async (ctx) => {
    logger.debug('HTTP: GET ORDERS');
    const queryData = clearObjectKeys(
      ctx.query,
      queryArgs,
    );
    const {
      traderAssetData,
      traderAddress,
      includeShadowed = false,
      networkId = 1,
      page = 1,
      perPage = 100,
      ...baseQuery
    } = queryData;
    const orders = await Order.find({
      networkId,
      ...baseQuery,
      ...(
        includeShadowed
          ? ({
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
          }) : {
            isValid: true,
          }
      ),
      ...(
        traderAssetData
          ? ({
            $and: [
              {
                $or: [
                  {
                    makerAssetData: traderAssetData,
                  },
                  {
                    takerAssetData: traderAssetData,
                  },
                ],
              },
            ],
          }) : {}
      ),
      ...(
        traderAddress
          ? ({
            $and: [
              {
                $or: [
                  {
                    makerAddress: traderAddress,
                  },
                  {
                    takerAddress: traderAddress,
                  },
                ],
              },
            ],
          }) : {}
      ),
    })
      .skip(perPage * (page - 1))
      .limit(parseInt(perPage, 10))
      .lean();
    if (
      baseQuery.makerAssetData
      && baseQuery.takerAssetData
    ) {
      orders.sort(sort);
    }
    const records = orders.map(constructOrderRecord);
    const response = {
      total: orders.length,
      page: parseInt(page, 10),
      perPage,
      records,
    };
    ctx.status = 200;
    ctx.message = 'A collection of 0x orders with meta-data as specified by query params';
    ctx.body = response;
  });

  standardRelayerApi.get('/order/:orderHash', async (ctx) => {
    logger.debug('HTTP: GET ORDER BY HASH');
    const { networkId = 1 } = ctx.query;
    const order = await Order.findOne({
      orderHash: ctx.params.orderHash,
      networkId,
    })
      .lean();
    const response = constructOrderRecord(order);
    ctx.status = 200;
    ctx.message = 'The order and meta info associated with the orderHash';
    ctx.body = response;
  });
}
