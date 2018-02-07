// @flow
import type BigNumber from 'bignumber.js';
import * as actionTypes from '../actions/types';

import type {
  ID,
} from '../types';

export type OrderAttributes = {
  price: string,
  amount: string,
  total: string,
  type: string,
  expires: Date,
  completed_at?: Date,
};

export type OrderRelationships = {
};

export type OrdersById = {
  id: ID,
  attributes: OrderAttributes,
  relationships: OrderRelationships,
};

export type OrdersResourcesReducer = {
  byId: {
    [ID]: OrdersById,
  },
  allIds: Array<string>,
};

export type Order = {
  id: ID,
} & OrderAttributes;

export type Orders = Array<Order>;

export type ZrxOrder = {
  maker: string,
  taker: string,
  feeRecipient: string,
  exchangeContractAddress: string,
  salt: string,
  makerFee: BigNumber,
  takerFee: BigNumber,
  makerTokenAddress: string,
  takerTokenAddress: string,
  makerTokenAmount: string,
  takerTokenAmount: string,
  expirationUnixTimestampSec: string,
}

export type OrderData = {
  amount: number,
  exp: Date,
  price: number,
  type: string,
}

export type OrdersAction =
{|
  type: typeof actionTypes.CANCEL_ORDER,
  payload: string,
|} |
{|
  type: typeof actionTypes.CREATE_ORDER,
  payload: OrderData,
|} |
{|
  type: typeof actionTypes.FILL_ORDER,
  payload: ZrxOrder,
|}
