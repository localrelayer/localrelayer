import {
  createSelector,
} from 'reselect';

import {
  coreSelectors as cs,
} from 'instex-core';
import {
  Web3Wrapper,
} from '@0xproject/web3-wrapper';
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
    currentPairId,
  ) => {
    const pair = assetPairs[currentPairId];
    const pairTradingInfo = tradingInfo[currentPairId];
    return pair ? {
      ...pair,
      assetDataA: {
        ...pair.assetDataA,
        assetData: assets[pair.assetDataA.assetData],
      },
      assetDataB: {
        ...pair.assetDataB,
        assetData: assets[pair.assetDataB.assetData],
      },
      tradingInfo: pairTradingInfo,
    } : null;
  },
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
        const assetFormattedBalance = Web3Wrapper.toUnitAmount(
          new BigNumber(balance[asset.address] || 0),
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
