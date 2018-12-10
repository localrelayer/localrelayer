import {
  createSelector,
} from 'reselect';
import {
  coreSelectors as cs,
  utils,
} from 'instex-core';

import {
  BigNumber,
  assetDataUtils,
} from '0x.js';
import {
  getUiState,
} from '.';

export const getCurrentOrder = createSelector(
  [
    getUiState('currentAssetPairId'),
    getUiState('currentOrderId'),
    cs.getResourceMap('assets'),
    cs.getResourceMap('orders'),
    cs.getBidOrders,
    cs.getAskOrders,
    cs.getWalletState('balance'),
    cs.getResourceMappedList('orders', 'userOrders'),
  ],
  (
    currentAssetPairId,
    currentOrderId,
    assets,
    orders,
    bids,
    asks,
    balance,
    userOrders,
  ) => {
    if (currentOrderId) {
      const orderType = utils.getOrderType(
        currentAssetPairId.split('_')[0],
        orders[currentOrderId].makerAssetData,
      );
      const assetDataB = currentAssetPairId.split('_')[1];
      const ordersTypes = orderType === 'bid' ? bids : asks;
      const numInOrderList = ordersTypes.reduce(
        (
          acc,
          order,
          index,
        ) => (
          order.id === currentOrderId ? index : acc
        ), 0,
      );
      const sumUpOrders = orderType === 'bid'
        ? bids.slice(0, numInOrderList + 1)
        : asks.slice(0, numInOrderList + 1);
      const fundsInOrders = userOrders.reduce((acc, cur) => {
        if (cur.makerAssetData === assetDataB) {
          return acc.add(cur.makerAssetAmount);
        }
        return acc;
      }, new BigNumber(0));
      const ordersInfo = sumUpOrders.reduce((acc, order) => {
        const amount = +utils.toUnitAmount(
          orderType === 'bid'
            ? order.metaData.remainingFillableTakerAssetAmount
            : order.metaData.remainingFillableMakerAssetAmount,
          assets[order.makerAssetData].decimals,
        );
        const price = +utils.getOrderPrice(
          orderType,
          order.metaData.remainingFillableMakerAssetAmount,
          order.metaData.remainingFillableTakerAssetAmount,
        );
        acc.amount += amount;
        acc.price = price;
        return acc;
      }, {
        price: 0,
        amount: 0,
      });
      const takerAssetAddress = assetDataUtils.decodeERC20AssetData(
        orders[currentOrderId].takerAssetData,
      ).tokenAddress;
      const { decimals } = assets[orders[currentOrderId].takerAssetData];
      const userAvailableBalance = utils.toUnitAmount(
        new BigNumber(balance[takerAssetAddress]).minus(fundsInOrders),
        decimals,
      );
      let amount;
      if (orderType === 'bid') {
        amount = userAvailableBalance > ordersInfo.amount
          ? ordersInfo.amount.toFixed(8)
          : userAvailableBalance.toFixed(8);
      } else {
        amount = (
          userAvailableBalance > (ordersInfo.amount * ordersInfo.price)
            ? ordersInfo.amount.toFixed(8)
            : (
              new BigNumber(
                userAvailableBalance,
              )
                .div(ordersInfo.price.toFixed(8))
                .toFixed(8)
            )
        );
      }
      return {
        amount,
        price: ordersInfo.price.toFixed(8),
      };
    }
    return {};
  },
);
