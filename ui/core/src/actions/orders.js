// @flow
import * as actionTypes from './actionTypes';

export const postOrderRequest = ({
  order,
  formActions,
  shouldMatch,
}) => ({
  type: actionTypes.POST_ORDER_REQUEST,
  order,
  formActions,
  shouldMatch,
});

export const fillOrderRequest = ({
  order,
  formActions,
  ordersToFill,
  makerAssetFillAmounts,
  takerAssetFillAmounts,
}) => ({
  type: actionTypes.FILL_ORDER_REQUEST,
  order,
  formActions,
  ordersToFill,
  makerAssetFillAmounts,
  takerAssetFillAmounts,
});

export const cancelOrderRequest = order => ({
  type: actionTypes.CANCEL_ORDER_REQUEST,
  order,
});
