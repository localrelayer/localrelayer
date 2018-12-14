import {
  assetDataUtils,
} from '0x.js';
import {
  createSelector,
} from 'reselect';
import {
  getResourceIds,
  getResourceMap,
} from './resources';
import {
  utils,
} from '../index';


export const getAssetByIdField = ({
  fieldName,
  value,
}) => (
  createSelector(
    [getResourceMap('assets')],
    (assets) => {
      const assetAddress = Object.keys(assets)
        .find(address => (assets[address][fieldName] === value));
      return assetAddress ? assets[assetAddress] : null;
    },
  )
);

export const constructAssetPair = ({
  assetPair,
  assets,
  decodeTokenAddress = false,
}) => ({
  ...assetPair,
  assetDataA: {
    ...assetPair.assetDataA,
    assetData: assets[
      decodeTokenAddress
        ? assetDataUtils.decodeERC20AssetData(assetPair.assetDataA.assetData).tokenAddress
        : assetPair.assetDataA.assetData
    ],
  },
  assetDataB: {
    ...assetPair.assetDataB,
    assetData: assets[
      decodeTokenAddress
        ? assetDataUtils.decodeERC20AssetData(assetPair.assetDataB.assetData).tokenAddress
        : assetPair.assetDataB.assetData
    ],
  },
});

export const getListedAssetPairs = createSelector(
  [
    getResourceIds('assetPairs', 'listed'),
    getResourceMap('assetPairs'),
    getResourceMap('assets'),
    getResourceMap('tradingInfo'),
  ],
  (
    ids = [],
    assetPairs,
    assets,
    assetPairTradingInfo,
  ) => {
    const listedPairs = ids.map(id => (
      constructAssetPair({
        assetPair: assetPairs[id],
        assets,
      })
    ));
    return listedPairs.map((pair) => {
      const assetBVolume = utils.toUnitAmount(
        assetPairTradingInfo[pair.id]?.assetBVolume || 0,
        pair.assetDataB.assetData.decimals,
      ).toNumber();
      return {
        ...pair,
        tradingInfo:
          {
            assetBVolume,
            lastPrice: assetPairTradingInfo[pair.id]?.lastPrice || 0,
            change24: assetPairTradingInfo[pair.id]?.change24 || 0,
          } || {},
      };
    });
  },
);
