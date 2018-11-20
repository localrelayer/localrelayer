// @flow
// import * as types from './types';
import type {
  // ZrxOrder,
  // OrdersAction,
  Order,
} from '../types';
import * as actionTypes from './actionTypes';

/*
export function cancelOrder(orderId: string): OrdersAction {
  return {
    type: types.CANCEL_ORDER,
    orderId,
  };
}

export function createOrder(): OrdersAction {
  return {
    type: types.CREATE_ORDER,
  };
}

export function fillOrder(zrxOrder: ZrxOrder): OrdersAction {
  return {
    type: types.FILL_ORDER,
    payload: zrxOrder,
  };
}

export function fillOrKillOrders(order: Object, orders: Array<*>) {
  return {
    type: types.FILL_OR_KILL_ORDERS,
    payload: { orders, order },
  };
}

*/

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
