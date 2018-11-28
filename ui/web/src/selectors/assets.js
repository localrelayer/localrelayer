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


export const getCurrentAssetPair = createSelector(
  [
    cs.getResourceMap('assets'),
    cs.getResourceMap('assetPairs'),
    cs.getResourceMap('tradingInfo'),
    s => s.ui.currentAssetPairId,
  ],
  (
    assets,
    assetPairs,
    tradingInfo,
    currentAssetPairId,
  ) => {
    const assetPair = cs.constructAssetPair({
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
    s => s.ui.currentAssetPairId,
    cs.getWalletState('balance'),
    cs.getWalletState('allowance'),
  ],
  (
    assets,
    currentPairId,
    balance,
    allowance,
  ) => {
    if (currentPairId) {
      return currentPairId.split('_').map((key) => {
        const asset = assets[key];
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
    }
    return [];
  },
);
