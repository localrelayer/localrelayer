// @flow

import type {
  ID,
} from '../types';


export type OrderAttributes = {
  price: string,
  amount: string,
  total: string,
  id: ID,
  action: string,
  expires: Date
};

export type OrderRelationships = {
};

export type OrdersById = {
  id: string,
  attributes: OrderAttributes,
  relationships: OrderRelationships,
};

export type OrdersResourcesReducer = {
  byId: OrdersById,
  allIds: Array<string>,
};

