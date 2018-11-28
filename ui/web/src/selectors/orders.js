import {
  createSelector,
} from 'reselect';
import {
  coreSelectors as cs,
  utils,
} from 'instex-core';
import {
  getUiState,
} from '.';

export const getTradingHistory = createSelector(
  [
    cs.getTradingHistory,
    cs.getResourceMap('assets'),
    getUiState('currentAssetPairId'),
  ],
  (
    orders,
    assets,
    currentAssetPairId,
  ) => (
    orders.map(order => ({
      ...order,
      amount: utils.toUnitAmount(
        order.makerAssetAmount,
        assets[order.makerAssetData].decimals,
      ).toFixed(8),
      total: utils.toUnitAmount(
        order.takerAssetAmount,
        assets[order.takerAssetData].decimals,
      ).toFixed(8),
      price: utils.getPrice(
        utils.getType(currentAssetPairId.split('_')[0], order.makerAssetData),
        order.makerAssetAmount,
        order.takerAssetAmount,
      ).toFixed(8),
      key: order.id,
      completedAt: order.metaData.completedAt,
      type: utils.getType(currentAssetPairId.split('_')[0], order.makerAssetData),
    }))
  ),
);

export const getBidOrders = createSelector(
  [
    cs.getBidOrders,
    cs.getResourceMap('assets'),
  ],
  (orders, assets) => (
    orders.map(order => ({
      ...order,
      amount: utils.toUnitAmount(
        order.makerAssetAmount,
        assets[order.makerAssetData].decimals,
      ).toFixed(8),
      total: utils.toUnitAmount(
        order.takerAssetAmount,
        assets[order.takerAssetData].decimals,
      ).toFixed(8),
      price: utils.getPrice(
        'bid',
        order.makerAssetAmount,
        order.takerAssetAmount,
      ).toFixed(8),
    }))
  ),
);

export const getAskOrders = createSelector(
  [
    cs.getAskOrders,
    cs.getResourceMap('assets'),
  ],
  (orders, assets) => (
    orders.map(order => ({
      ...order,
      amount: utils.toUnitAmount(
        order.makerAssetAmount,
        assets[order.makerAssetData].decimals,
      ).toFixed(8),
      total: utils.toUnitAmount(
        order.takerAssetAmount,
        assets[order.takerAssetData].decimals,
      ).toFixed(8),
      price: utils.getPrice(
        'ask',
        order.makerAssetAmount,
        order.takerAssetAmount,
      ).toFixed(8),
    }))
  ),
);

export const getOpenOrders = createSelector(
  [
    cs.getResourceMappedList('orders', 'userOrders'),
    getUiState('currentAssetPairId'),
    cs.getResourceMap('assets'),
  ],
  (
    orders,
    currentAssetPairId,
    assets,
  ) => (
    orders.map(order => ({
      ...order,
      pair: `${assets[order.makerAssetData].symbol}/${assets[order.takerAssetData].symbol}`,
      amount: utils.toUnitAmount(
        order.makerAssetAmount,
        assets[order.makerAssetData].decimals,
      ).toFixed(8),
      total: utils.toUnitAmount(
        order.takerAssetAmount,
        assets[order.takerAssetData].decimals,
      ).toFixed(8),
      price: utils.getPrice(
        utils.getType(currentAssetPairId.split('_')[0], order.makerAssetData),
        order.makerAssetAmount,
        order.takerAssetAmount,
      ).toFixed(8),
      action: (
        (currentAssetPairId || '_').split('_')[0] === order.makerAssetData
          ? 'Sell'
          : 'Buy'
      ),
    }))
  ),
);

export const getCurrentOrder = createSelector(
  [
    getUiState('currentAssetPairId'),
    getUiState('currentOrderId'),
    cs.getResourceMap('assets'),
    cs.getResourceMap('orders'),
  ],
  (
    currentAssetPairId,
    currentOrderId,
    assets,
    orders,
  ) => (currentOrderId
    ? {
      amount: utils.toUnitAmount(
        orders[currentOrderId].makerAssetAmount,
        assets[orders[currentOrderId].makerAssetData].decimals,
      ).toFixed(8),
      price: utils.getPrice(
        utils.getType(currentAssetPairId.split('_')[0], orders[currentOrderId].makerAssetData),
        orders[currentOrderId].makerAssetAmount,
        orders[currentOrderId].takerAssetAmount,
      ).toFixed(8),
    } : {}),
);
