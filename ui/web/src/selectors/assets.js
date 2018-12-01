import {
  createSelector,
} from 'reselect';

import {
  coreSelectors as cs,
  utils,
} from 'instex-core';
import {
  BigNumber,
} from '0x.js';
import {
  getUiState,
} from './ui';


export const getCurrentAssetPair = createSelector(
  [
    cs.getResourceMap('assets'),
    cs.getResourceMap('assetPairs'),
    cs.getResourceMap('tradingInfo'),
    getUiState('currentAssetPairId'),
  ],
  (
    assets,
    assetPairs,
    tradingInfo,
    currentAssetPairId,
  ) => {
    const assetPair = currentAssetPairId && cs.constructAssetPair({
      assetPair: assetPairs[currentAssetPairId],
      assets,
    });

    return currentAssetPairId
      ? ({
        ...assetPair,
        tradingInfo: {
          ...tradingInfo[currentAssetPairId],
          assetAVolume: utils.toUnitAmount(
            tradingInfo[currentAssetPairId]?.assetAVolume || 0,
            assetPair.assetDataA.assetData.decimals,
          ).toFixed(8),
          assetBVolume: utils.toUnitAmount(
            tradingInfo[currentAssetPairId]?.assetBVolume || 0,
            assetPair.assetDataB.assetData.decimals,
          ).toFixed(8),
        },
      })
      : null;
  },
);

export const getCurrentAssetPairWithBalance = createSelector(
  [
    getCurrentAssetPair,
    cs.getWalletState('balance'),
  ],
  (
    currentAssetPair,
    balance,
  ) => (
    currentAssetPair
      ? ({
        ...currentAssetPair,
        assetDataA: {
          ...currentAssetPair.assetDataA,
          balance: utils.toUnitAmount(
            balance[currentAssetPair.assetDataA.assetData.address] || 0,
            currentAssetPair.assetDataA.assetData.decimals,
          ).toFixed(8),
        },
        assetDataB: {
          ...currentAssetPair.assetDataB,
          balance: utils.toUnitAmount(
            balance[currentAssetPair.assetDataB.assetData.address] || 0,
            currentAssetPair.assetDataB.assetData.decimals,
          ).toFixed(8),
        },
      })
      : null
  ),
);

export const getAssetsWithBalanceAndAllowance = createSelector(
  [
    cs.getResourceMap('assets'),
    cs.getResourceMappedList('assets'),
    getUiState('currentAssetPairId'),
    getUiState('pathname'),
    cs.getWalletState('balance'),
    cs.getWalletState('allowance'),
  ],
  (
    assetsResources,
    allAssets,
    currentPairId,
    currentPathname,
    balance,
    allowance,
  ) => {
    const assets = (
      currentPathname === '/account'
        ? (
          allAssets
        )
        : (
          (currentPairId || '').split('_')
            .filter(exist => exist)
            .map(key => assetsResources[key])
        )
    );
    return assets.map((asset) => {
      const assetFormattedBalance = utils.toUnitAmount(
        balance[asset.address] || 0,
        asset.decimals,
      ).toFixed(8);
      const isTradable = new BigNumber(allowance[asset.address] || 0).gt(0);
      return {
        ...asset,
        balance: assetFormattedBalance,
        isTradable,
      };
    });
  },
);
