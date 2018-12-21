// @flow
import * as actionTypes from './actionTypes';

export const postOrderRequest = ({
  order,
  formActions,
}) => ({
  type: actionTypes.POST_ORDER_REQUEST,
  order,
  formActions,
});

export const cancelOrderRequest = order => ({
  type: actionTypes.CANCEL_ORDER_REQUEST,
  order,
});

export const sendMatchedOrders = orders => ({
  type: actionTypes.SEND_MATCHED_ORDERS,
  orders,
});
