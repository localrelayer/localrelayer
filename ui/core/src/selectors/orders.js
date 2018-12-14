// @flow
import {
  BigNumber,
} from '0x.js';
import {
  createSelector,
} from 'reselect';

import {
  getResourceMap,
  getResourceMappedList,
} from './resources';
import {
  getPendingTransactionsRelativeState,
} from './transactions';
import {
  toUnitAmount,
  getOrderPrice,
  getOrderType,
  sortOrderbook,
} from '../utils';

export const getTradingHistory = listName => createSelector(
  [
    getResourceMappedList('orders', listName),
    getResourceMap('assets'),
    getResourceMap('assetPairs'),
  ],
  (
    orders,
    assets,
    assetPairs,
  ) => orders.map((order) => {
    const assetPair = (
      assetPairs[`${order.makerAssetData}_${order.takerAssetData}`]
      || assetPairs[`${order.takerAssetData}_${order.makerAssetData}`]
    );
    if (!assetPair) {
      return false;
    }
    const orderType = getOrderType(
      assetPair.id.split('_')[0],
      order.makerAssetData,
    );

    const filledMakerAssetAmount = new BigNumber(order.makerAssetAmount)
      .times(order.metaData.filledTakerAssetAmount)
      .div(order.takerAssetAmount)
      .toFixed(8);

    const amount = orderType === 'bid'
      ? toUnitAmount(
        order.metaData.filledTakerAssetAmount,
        assets[order.takerAssetData].decimals,
      ).toFixed(8)
      : toUnitAmount(
        filledMakerAssetAmount,
        assets[order.makerAssetData].decimals,
      ).toFixed(8);

    const total = orderType === 'bid'
      ? toUnitAmount(
        filledMakerAssetAmount,
        assets[order.makerAssetData].decimals,
      ).toFixed(8)
      : toUnitAmount(
        order.metaData.filledTakerAssetAmount,
        assets[order.takerAssetData].decimals,
      ).toFixed(8);
    return {
      ...order,
      pair: `${assets[order.makerAssetData].symbol}/${assets[order.takerAssetData].symbol}`,
      status: order.metaData.error === 'ORDER_REMAINING_FILL_AMOUNT_ZERO' ? 'Completed' : 'Canceled',
      amount,
      total,
      price: getOrderPrice(
        orderType,
        toUnitAmount(order.makerAssetAmount,
          assets[order.makerAssetData].decimals),
        toUnitAmount(order.takerAssetAmount,
          assets[order.takerAssetData].decimals),
      ).toFixed(8),
      key: order.id,
      completedAt: order.metaData.completedAt,
      lastFilledAt: order.metaData.lastFilledAt,
      type: orderType,
    };
  }).filter(Boolean).sort((a, b) => {
    const date1 = new Date(a.lastFilledAt);
    const date2 = new Date(b.lastFilledAt);
    if (date1 > date2) return -1;
    if (date1 < date2) return 1;
    return 0;
  }),
);

export const getBidOrders = createSelector(
  [
    getResourceMappedList('orders', 'bids'),
    getResourceMap('assets'),
  ],
  (
    orders,
    assets,
  ) => (
    orders.filter(o => o.metaData.isValid).map(order => ({
      ...order,
      amount: toUnitAmount(
        order.metaData.remainingFillableTakerAssetAmount,
        assets[order.takerAssetData].decimals,
      ).toFixed(8),
      total: toUnitAmount(
        order.metaData.remainingFillableMakerAssetAmount,
        assets[order.makerAssetData].decimals,
      ).toFixed(8),
      price: getOrderPrice(
        'bid',
        toUnitAmount(order.makerAssetAmount,
          assets[order.makerAssetData].decimals),
        toUnitAmount(order.takerAssetAmount,
          assets[order.takerAssetData].decimals),
      ).toFixed(8),
    })).sort(sortOrderbook)
  ),
);

export const getAskOrders = createSelector(
  [
    getResourceMappedList('orders', 'asks'),
    getResourceMap('assets'),
  ],
  (orders, assets) => (
    orders.filter(o => o.metaData.isValid).map(order => ({
      ...order,
      amount: toUnitAmount(
        order.metaData.remainingFillableMakerAssetAmount,
        assets[order.makerAssetData].decimals,
      ).toFixed(8),
      total: toUnitAmount(
        order.metaData.remainingFillableTakerAssetAmount,
        assets[order.takerAssetData].decimals,
      ).toFixed(8),
      price: getOrderPrice(
        'ask',
        toUnitAmount(order.makerAssetAmount,
          assets[order.makerAssetData].decimals),
        toUnitAmount(order.takerAssetAmount,
          assets[order.takerAssetData].decimals),
      ).toFixed(8),
    })).sort(sortOrderbook)
  ),
);

export const getUserOpenOrders = createSelector(
  [
    getResourceMappedList('orders', 'userOrders'),
    getResourceMap('assets'),
    getResourceMap('assetPairs'),
    getPendingTransactionsRelativeState,
  ],
  (
    orders,
    assets,
    assetPairs,
    pendingTransactionsRelativeState,
  ) => (
    orders.map((order) => {
      const assetPair = (
        assetPairs[`${order.makerAssetData}_${order.takerAssetData}`]
        || assetPairs[`${order.takerAssetData}_${order.makerAssetData}`]
      );
      if (!assetPair) {
        return false;
      }
      const orderType = getOrderType(
        assetPair.id.split('_')[0],
        order.makerAssetData,
      );

      const amount = orderType === 'bid'
        ? toUnitAmount(
          order.metaData.remainingFillableTakerAssetAmount,
          assets[order.takerAssetData].decimals,
        ).toFixed(8)
        : toUnitAmount(
          order.metaData.remainingFillableMakerAssetAmount,
          assets[order.makerAssetData].decimals,
        ).toFixed(8);

      const total = orderType === 'bid'
        ? toUnitAmount(
          order.metaData.remainingFillableMakerAssetAmount,
          assets[order.makerAssetData].decimals,
        ).toFixed(8)
        : toUnitAmount(
          order.metaData.remainingFillableTakerAssetAmount,
          assets[order.takerAssetData].decimals,
        ).toFixed(8);

      return ({
        ...order,
        pair: `${assets[order.makerAssetData].symbol}/${assets[order.takerAssetData].symbol}`,
        amount,
        total,
        isCancelPending: pendingTransactionsRelativeState.cancel[order.metaData.orderHash],
        price: getOrderPrice(
          orderType,
          toUnitAmount(order.makerAssetAmount,
            assets[order.makerAssetData].decimals),
          toUnitAmount(order.takerAssetAmount,
            assets[order.takerAssetData].decimals),
        ).toFixed(8),
        action: (
          assetPair.id.split('_')[0] === order.makerAssetData
            ? 'Sell'
            : 'Buy'
        ),
      });
    })
  ),
);
