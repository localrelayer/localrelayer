import {
  createSelector,
} from 'reselect';
import {
  coreSelectors as cs,
  utils,
} from 'localrelayer-core';

import {
  BigNumber,
  assetDataUtils,
} from '0x.js';
import {
  getUiState,
  getCurrentAssetPair,
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
      const [assetDataA, assetDataB] = currentAssetPairId.split('_');
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

      const ordersInfo = sumUpOrders.reduce((acc, order) => {
        const amount = +utils.toUnitAmount(
          orderType === 'bid'
            ? order.metaData.remainingFillableTakerAssetAmount
            : order.metaData.remainingFillableMakerAssetAmount,
          orderType === 'bid'
            ? assets[order.takerAssetData].decimals
            : assets[order.makerAssetData].decimals,
        );
        const price = +utils.getOrderPrice(
          orderType,
          utils.toUnitAmount(
            order.metaData.remainingFillableMakerAssetAmount,
            assets[order.makerAssetData].decimals,
          ),
          utils.toUnitAmount(
            order.metaData.remainingFillableTakerAssetAmount,
            assets[order.takerAssetData].decimals,
          ),
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
      const decimalsTaker = assets[orders[currentOrderId].takerAssetData].decimals;

      const fundsInOrders = userOrders.reduce((acc, cur) => {
        if (cur.makerAssetData === (orderType === 'bid'
          ? assetDataA
          : assetDataB)
        ) {
          return acc.add(cur.makerAssetAmount);
        }
        return acc;
      }, new BigNumber(0));

      const userAvailableBalance = utils.toUnitAmount(
        new BigNumber(balance[takerAssetAddress] || 0)
          .minus(fundsInOrders),
        decimalsTaker,
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
                userAvailableBalance || 0,
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

export const getAskOrdersFormatted = createSelector(
  [
    cs.getAskOrders,
    cs.getWalletState('selectedAccount'),
  ],
  (orders, userAddress) => (
    orders.map(order => ({
      ...order,
      barWidth: utils.calculateBar(order, orders),
      formattedExpirationTime: utils.formatDate('MM/DD/YYYY HH:mm:ss', order.expirationTimeSeconds * 1000),
      isUser: order.makerAddress === userAddress,
    }))
  ),
);


export const getBidOrdersFormatted = createSelector(
  [
    cs.getBidOrders,
    cs.getWalletState('selectedAccount'),
  ],
  (orders, userAddress) => (
    orders.map(order => ({
      ...order,
      barWidth: utils.calculateBar(order, orders),
      formattedExpirationTime: utils.formatDate('MM/DD/YYYY HH:mm:ss', order.expirationTimeSeconds * 1000),
      isUser: order.makerAddress === userAddress,
    }))
  ),
);

export const getTradingHistoryFormatted = listName => createSelector(
  [
    cs.getTradingHistory(listName),
  ],
  orders => (
    orders.map(order => ({
      ...order,
      lastFilledAtFormattedLong: utils.formatDate('MM/DD/YYYY HH:mm:ss', order.lastFilledAt),
      lastFilledAtFormattedShort: utils.formatDate('MM/DD HH:mm', order.lastFilledAt),
    }))
  ),
);

export const getUserOpenOrdersFormatted = createSelector(
  [
    cs.getUserOpenOrders,
  ],
  orders => (
    orders.map(order => ({
      ...order,
      createdAtFormattedLong: utils.formatDate('MM/DD/YYYY HH:mm:ss', order.metaData.createdAt),
      createdAtFormattedShort: utils.formatDate('MM/DD HH:mm', order.metaData.createdAt),
    }))
  ),
);

export const getMatchedMarketOrders = createSelector(
  [
    cs.getBidOrders,
    cs.getAskOrders,
    getUiState('currentBuySellTab'),
    getUiState('marketAmount'),
    getCurrentAssetPair,
    cs.getWalletState('selectedAccount'),
  ],
  (
    bids,
    asks,
    currentBuySellTab,
    marketAmount,
    currentAssetPair,
    makerAddress,
  ) => {
    if (utils.isNumber(marketAmount)) {
      const type = currentBuySellTab.toLowerCase().includes('bid') ? 'bid' : 'ask';
      const matchedOrders = type === 'bid' ? asks : bids;
      const decimals = type === 'bid'
        ? currentAssetPair.assetDataA.assetData.decimals
        : currentAssetPair.assetDataB.assetData.decimals;

      const [
        assetDataA,
        assetDataB,
      ] = currentAssetPair.id.split('_');

      const makerAssetData = type === 'bid'
        ? assetDataA
        : assetDataB;

      const takerAssetData = type === 'bid'
        ? assetDataB
        : assetDataA;

      const result = matchedOrders
        .filter(order => order.makerAddress !== makerAddress)
        .reduce((acc, cur) => {
          let filledMakerAmount;
          let filledTakerAmount;
          let neededAssetAmount;

          if (acc.neededAssetAmount.eq(0)) return acc;

          if (type === 'bid') {
            filledMakerAmount = BigNumber
              .min(cur.metaData.remainingFillableMakerAssetAmount, acc.neededAssetAmount);
            filledTakerAmount = new BigNumber(cur.metaData.remainingFillableTakerAssetAmount)
              .times(filledMakerAmount)
              .div(cur.metaData.remainingFillableMakerAssetAmount);
            neededAssetAmount = acc.neededAssetAmount.minus(filledMakerAmount);
          } else {
            filledTakerAmount = BigNumber
              .min(cur.metaData.remainingFillableTakerAssetAmount, acc.neededAssetAmount);
            filledMakerAmount = new BigNumber(cur.metaData.remainingFillableMakerAssetAmount)
              .times(filledTakerAmount)
              .div(cur.metaData.remainingFillableTakerAssetAmount);
            neededAssetAmount = acc.neededAssetAmount.minus(filledTakerAmount);
          }
          return {
            ordersToFill: acc.ordersToFill.concat(cur),
            makerAssetFillAmounts: acc.makerAssetFillAmounts.concat(filledMakerAmount),
            takerAssetFillAmounts: acc.takerAssetFillAmounts.concat(filledTakerAmount),
            makerFillAmount: acc.makerFillAmount.add(filledMakerAmount),
            takerFillAmount: acc.takerFillAmount.add(filledTakerAmount),
            neededAssetAmount,
          };
        }, {
          ordersToFill: [],
          makerAssetFillAmounts: [],
          takerAssetFillAmounts: [],
          makerFillAmount: new BigNumber(0),
          takerFillAmount: new BigNumber(0),
          neededAssetAmount: utils.toBaseUnitAmount(marketAmount, decimals),
        });

      const ordersTotal = type === 'bid'
        ? utils.toUnitAmount(result.takerFillAmount, decimals)
        : utils.toUnitAmount(result.makerFillAmount, decimals);

      const ordersAmount = type === 'bid'
        ? utils.toUnitAmount(result.makerFillAmount, decimals)
        : utils.toUnitAmount(result.takerFillAmount, decimals);

      return {
        ...result,
        ordersTotal: ordersTotal.toFixed(8),
        ordersAmount: ordersAmount.toFixed(8),
        order: {
          makerAssetAmount: result.makerFillAmount,
          takerAssetAmount: result.takerFillAmount,
          makerAssetData,
          takerAssetData,
        },
      };
    }
    return {
      ordersTotal: (0).toFixed(8),
    };
  },
);
