// @flow
import * as types from './types';


export function cancelOrder(orderId: string) {
  return {
    type: types.CANCEL_ORDER,
    payload: orderId,
  };
}
