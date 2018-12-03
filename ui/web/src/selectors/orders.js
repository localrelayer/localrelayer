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
  ) => {
    if (currentOrderId) {
      const orderType = utils.getOrderType(currentAssetPairId.split('_')[0], orders[currentOrderId].makerAssetData);

      return {
        amount: utils.toUnitAmount(
          orderType === 'bid'
            ? orders[currentOrderId].metaData.remainingFillableTakerAssetAmount
            : orders[currentOrderId].metaData.remainingFillableMakerAssetAmount,
          assets[orders[currentOrderId].makerAssetData].decimals,
        ).toFixed(8),
        price: utils.getOrderPrice(
          orderType,
          orders[currentOrderId].metaData.remainingFillableMakerAssetAmount,
          orders[currentOrderId].metaData.remainingFillableTakerAssetAmount,
        ).toFixed(8),
      };
    }
    return {};
  },
);
