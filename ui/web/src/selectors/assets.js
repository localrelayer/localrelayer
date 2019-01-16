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
    const decimalsGap = currentAssetPairId && Math.abs(assetPair.assetDataA.assetData.decimals
      - assetPair.assetDataB.assetData.decimals);
    return currentAssetPairId
      ? ({
        ...assetPair,
        tradingInfo: {
          ...tradingInfo[currentAssetPairId],
          lastPrice: utils.toUnitAmount(
            tradingInfo[currentAssetPairId]?.lastPrice,
            decimalsGap,
          ).toFixed(8),
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
    cs.getResourceMappedList('orders', 'userOrders'),
  ],
  (
    currentAssetPair,
    balance,
    orders,
  ) => {
    if (!currentAssetPair) return null;

    const [assetDataA, assetDataB] = currentAssetPair.id.split('_');

    const assetDataALockedAmount = orders.reduce((acc, cur) => {
      if (cur.makerAssetData === assetDataA) {
        return acc.add(cur.makerAssetAmount);
      }
      return acc;
    }, new BigNumber(0));

    const assetDataBLockedAmount = orders.reduce((acc, cur) => {
      if (cur.makerAssetData === assetDataB) {
        return acc.add(cur.makerAssetAmount);
      }
      return acc;
    }, new BigNumber(0));

    const assetATotalBalance = utils.toUnitAmount(
      balance[currentAssetPair.assetDataA.assetData.address] || 0,
      currentAssetPair.assetDataA.assetData.decimals,
    ).toFixed(8);

    const assetAAvailableBalance = utils.toUnitAmount(
      new BigNumber(
        balance[currentAssetPair.assetDataA.assetData.address] || 0,
      ).minus(assetDataALockedAmount),
      currentAssetPair.assetDataA.assetData.decimals,
    ).toFixed(8);

    const assetBTotalBalance = utils.toUnitAmount(
      balance[currentAssetPair.assetDataB.assetData.address] || 0,
      currentAssetPair.assetDataB.assetData.decimals,
    ).toFixed(8);

    const assetBAvailableBalance = utils.toUnitAmount(
      new BigNumber(
        balance[currentAssetPair.assetDataB.assetData.address] || 0,
      ).minus(assetDataBLockedAmount),
      currentAssetPair.assetDataB.assetData.decimals,
    ).toFixed(8);

    return ({
      ...currentAssetPair,
      assetDataA: {
        ...currentAssetPair.assetDataA,
        totalBalance: assetATotalBalance,
        availableBalance: new BigNumber(assetAAvailableBalance).gte(0)
          ? assetAAvailableBalance : (0).toFixed(8),
        unitMinAmount: utils.toUnitAmount(
          currentAssetPair.assetDataA.minAmount,
          currentAssetPair.assetDataA.assetData.decimals,
        ),
        unitMaxAmount: utils.toUnitAmount(
          currentAssetPair.assetDataA.maxAmount,
          currentAssetPair.assetDataA.assetData.decimals,
        ),
      },
      assetDataB: {
        ...currentAssetPair.assetDataB,
        totalBalance: assetBTotalBalance,
        availableBalance: new BigNumber(assetBAvailableBalance).gte(0)
          ? assetBAvailableBalance : (0).toFixed(8),
        unitMinAmount: utils.toUnitAmount(
          currentAssetPair.assetDataB.minAmount,
          currentAssetPair.assetDataB.assetData.decimals,
        ),
        unitMaxAmount: utils.toUnitAmount(
          currentAssetPair.assetDataB.maxAmount,
          currentAssetPair.assetDataB.assetData.decimals,
        ),
      },
    });
  },
);

export const getAssetsWithBalanceAndAllowance = createSelector(
  [
    cs.getResourceMap('assets'),
    getUiState('currentAssetPairId'),
    getUiState('pathname'),
    cs.getWalletState('balance'),
    cs.getWalletState('allowance'),
    cs.getResourceMappedList('orders', 'userOrders'),
    cs.getPendingTransactionsRelativeState,
  ],
  (
    assetsResources,
    currentPairId,
    currentPathname,
    balance,
    allowance,
    orders,
    pendingTransactionsRelativeState,
  ) => {
    const assets = (
      currentPathname === '/account'
        ? (
          Object.keys(assetsResources)
            .map(key => assetsResources[key])
        )
        : (
          (currentPairId || '').split('_')
            .filter(exist => exist)
            .map(key => assetsResources[key])
        )
    );

    return assets.map((asset) => {
      const assetLockedAmount = orders.reduce((acc, cur) => {
        if (cur.makerAssetData === asset.id) {
          return acc.add(cur.makerAssetAmount);
        }
        return acc;
      }, new BigNumber(0));

      const isTradable = new BigNumber(allowance[asset.address] || 0).gt(0);

      const assetTotalFormattedBalance = utils.toUnitAmount(
        balance[asset.address] || 0,
        asset.decimals,
      ).toFixed(8);

      const assetAvailableFormattedBalance = utils.toUnitAmount(
        new BigNumber(balance[asset.address] || 0).minus(assetLockedAmount),
        asset.decimals,
      ).toFixed(8);

      return {
        ...asset,
        totalBalance: assetTotalFormattedBalance,
        availableBalance: (
          new BigNumber(assetAvailableFormattedBalance).gte(0)
            ? assetAvailableFormattedBalance
            : (0).toFixed(8)
        ),
        isTradable,
        isTradablePending: (
          typeof allowance[asset.address] !== 'string'
          || (
            pendingTransactionsRelativeState.allowance[asset.id]
          )
        ),
        isBalancePending: (
          typeof balance[asset.address] !== 'string'
          || (
            pendingTransactionsRelativeState.balance[asset.id]
          )
        ),
      };
    });
  },
);

export const getQuoteTokens = createSelector(
  [
    cs.getListedAssetPairs,
  ],
  assetPairs => Object.values(assetPairs.reduce((acc, cur) => {
    acc[cur.assetDataB.assetData.address] = cur.assetDataB.assetData;
    return acc;
  }, {})),
);
