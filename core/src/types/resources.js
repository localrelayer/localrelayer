// @flow

import type {
  ID,
} from '../types';
import type {
  OrdersResourcesReducer,
  OrderAttributes,
  OrderRelationships,
} from './orders';
import type {
  TokensResourcesReducer,
  TokenAttributes,
  TokenRelationships,
} from './tokens';


export type ResourceAttributes =
  TokenAttributes
  | OrderAttributes

export type ResourceRelationships =
  TokenRelationships
  | OrderRelationships

export type ResourcesReducers = {
  orders: OrdersResourcesReducer,
  tokens: TokensResourcesReducer,
};

export type ResourceName = $Keys<ResourcesReducers>;
export type ResourceValue = $Values<ResourcesReducers>;

export type FetchResourceRequest = {
  resourceName: ResourceName,
  withDeleted: boolean,
};

export type FetchResourceRequestAction =
  {|
    type: string,
    payload: {
      resourceName: ResourceName,
      withDeleted: boolean,
    },
  |};

export type SaveResourceRequestAction =
  {|
    type: string,
    payload: {
      resourceName: ResourceName,
      data: any,
      list: string,
      request: string,
      lists?: Array<string>,
      mergeResources?: boolean,
      message?: string,
    },
  |};

export type DeleteResourceRequestAction = {|
  type: string,
  payload: {
    resourceName: ResourceName,
    id: ID,
  },
|};

export type DeleteResourceAction = {|
  type: string,
  payload: {
    resourceName: ResourceName,
    id: ID,
  },
|};

export type FillResourceItemsAction = {|
  type: string,
  payload: {
    resourceName: ResourceName,
    byId: {
      id: ID,
      attributes: ResourceAttributes,
      relationships: ResourceRelationships,
    },
    ids: Array<ID>,
  },
|};

export type AddResourceItemAction = {|
  type: string,
  payload: {
    id: ID,
    attributes: ResourceAttributes,
    relationships: ResourceRelationships,
  },
|};
