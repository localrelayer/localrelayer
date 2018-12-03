// @flow
import {
  BigNumber,
} from '0x.js';
import * as eff from 'redux-saga/effects';

import {
  utils,
} from 'instex-core';
import {
  actionTypes,
} from 'web-actions';
import {
  getUiState,
} from 'web-selectors';


function* takeFillOrderAndCalculateChartBar({
  orderFillChannel,
  chartBarCallback,
  assetPair,
}) {
  while (true) {
    const {
      order,
      metaData,
    } = yield eff.take(orderFillChannel);
    const currentAssetPairId = yield eff.select(getUiState('currentAssetPairId'));
    const [baseAssetData] = currentAssetPairId.split('_');

    const [
      price,
      amount,
    ] = (
      order.makerAssetData === baseAssetData
        ? [
          new BigNumber(order.takerAssetAmount).div(order.makerAssetAmount),
          order.makerAssetAmount,
        ]
        : [
          new BigNumber(order.makerAssetAmount).div(order.takerAssetAmount),
          order.takerAssetAmount,
        ]
    );

    // Convert volume to normal unit amount
    const volume = utils.toUnitAmount(
      amount,
      assetPair.assetDataB.assetData.decimals,
    );

    const bar = {
      volume,
      time: new Date(metaData.lastFilledAt).getTime(),
      open: parseFloat(price),
      close: parseFloat(price),
      low: parseFloat(price),
      high: parseFloat(price),
    };

    chartBarCallback(bar);
  }
}

export function* takeSubscribeOnChangeChartBar(orderFillChannel) {
  let task = null;
  while (true) {
    const {
      chartBarCallback,
      assetPair,
    } = yield eff.take(
      actionTypes.SUBSCRIBE_ON_CHANGE_CHART_BAR,
    );
    if (task) {
      yield eff.cancel(task);
    }
    task = yield eff.fork(
      takeFillOrderAndCalculateChartBar,
      {
        orderFillChannel,
        chartBarCallback,
        assetPair,
      },
    );
  }
}
