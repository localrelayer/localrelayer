// @flow
import * as types from './types';
import type { ZrxOrder } from '../types';

type OrderData = {
  amount: number,
  exp: Date,
  price: number,
  type: string,
}

export function cancelOrder(orderId: string) {
  return {
    type: types.CANCEL_ORDER,
    payload: orderId,
  };
}

export function createOrder({
  amount, exp, price, type,
}: OrderData) {
  return {
    type: types.CREATE_ORDER,
    payload: {
      amount,
      exp,
      price,
      type,
    },
  };
}

export function fillOrder(zrxOrder: ZrxOrder) {
  return {
    type: types.FILL_ORDER,
    payload: zrxOrder,
  };
}
