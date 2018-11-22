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
  constructOrderRecord,
} from 'utils';


const sortOrderbook = (a, b) => {
  const aPrice = new BigNumber(a.takerAssetAmount).div(a.makerAssetAmount);
  const aTakerFeePrice = new BigNumber(a.takerFee).div(a.takerAssetAmount);
  const bPrice = new BigNumber(b.takerAssetAmount).div(b.makerAssetAmount);
  const bTakerFeePrice = new BigNumber(b.takerFee).div(b.takerAssetAmount);
  const aExpirationTimeSeconds = parseInt(a.expirationTimeSeconds, 10);
  const bExpirationTimeSeconds = parseInt(b.expirationTimeSeconds, 10);
  return aPrice - bPrice
    || aTakerFeePrice - bTakerFeePrice
    || aExpirationTimeSeconds - bExpirationTimeSeconds;
};

export function createOrderBookEndpoint(standardRelayerApi) {
  standardRelayerApi.get('/orderbook', async (ctx) => {
    logger.debug('HTTP: GET orderbook');
    const {
      baseAssetData,
      quoteAssetData,
      page = 1,
      perPage = 100,
      networkId = 1,
    } = ctx.query;

    const bidOrders = await Order.find({
      takerAssetData: baseAssetData,
      makerAssetData: quoteAssetData,
      isValid: true,
      completedAt: { $exists: false },
      networkId,
    })
      .skip(perPage * (page - 1))
      .limit(parseInt(perPage, 10))
      .lean();

    const askOrders = await Order.find({
      takerAssetData: quoteAssetData,
      makerAssetData: baseAssetData,
      isValid: true,
      signature: { $exists: true },
      completedAt: { $exists: false },
      networkId,
    })
      .skip(perPage * (page - 1))
      .limit(parseInt(perPage, 10))
      .lean();

    const askOrdersSorted = askOrders.sort(sortOrderbook);
    const bidOrdersSorted = bidOrders.sort(sortOrderbook);

    const response = {
      bids: {
        records: bidOrdersSorted.map(constructOrderRecord),
        page: parseInt(page, 10),
        perPage: parseInt(perPage, 10),
        total: bidOrders.length,
      },
      asks: {
        records: askOrdersSorted.map(constructOrderRecord),
        page: parseInt(page, 10),
        perPage: parseInt(perPage, 10),
        total: askOrders.length,
      },
    };
    ctx.status = 200;
    ctx.message = 'The sorted order book for the specified asset pair.';
    ctx.body = response;
  });
}
