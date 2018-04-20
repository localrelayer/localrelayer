// @flow
import * as types from './types';
import type {
  ZrxOrder,
  OrderData,
  OrdersAction,
} from '../types';

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
