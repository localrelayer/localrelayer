// @flow

import type {
  ResourceName,
} from './types';

export const resources: Array<ResourceName> = [
  'orders',
  'currencies',
];

export const defaultResourcesInclude = {
  orders: [
    'currency',
  ],
  currencies: [
  ],
};
