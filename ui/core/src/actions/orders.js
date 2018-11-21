// @flow
import type {
  Order,
} from '../types';
import * as actionTypes from './actionTypes';

export function tradingChartSubscribeSocket(callback: Function, assetPair: Object) {
  return {
    type: actionTypes.TRADING_CHART_INITIALIZE_SUBSCRIBE,
    payload: { callback, assetPair },
  };
}

export function tradingChartOrderCreated(order: Order) {
  return {
    type: actionTypes.TRADING_CHART_SUBSCRIBE_ON_ORDER_CREATE,
    payload: { order },
  };
}

export const postOrderRequest = ({
  order,
  formActions,
}) => ({
  type: actionTypes.POST_ORDER_REQUEST,
  order,
  formActions,
});
