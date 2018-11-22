import {
  logger,
} from 'apiLogger';
import {
  AssetPair,
} from 'db';


export function createAssetPairsEndpoint(standardRelayerApi) {
  standardRelayerApi.get('/asset_pairs', async (ctx) => {
    logger.debug('HTTP: GET ASSET PAIRS');
    const {
      assetDataA = { $exists: true },
      assetDataB = { $exists: true },
      networkId = 1,
      page = 1,
      perPage = 100,
    } = ctx.query;
    const assetPairs = await AssetPair.find({
      'assetDataA.assetData': assetDataA,
      'assetDataB.assetData': assetDataB,
      networkId,
    }, {
      'assetDataA._id': 0,
      'assetDataB._id': 0,
    })
      .select('-_id -networkId')
      .skip(perPage * (page - 1))
      .limit(parseInt(perPage, 10));
    const response = {
      total: assetPairs.length,
      page: parseInt(page, 10),
      perPage,
      records: assetPairs,
    };
    ctx.status = 200;
    ctx.message = 'Returns a collection of available asset pairs with some meta info';
    ctx.body = response;
  });
}
