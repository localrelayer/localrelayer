// @flow

import type {
  ResourceName,
} from './types';

export const resources: Array<ResourceName> = [
  'orders',
  'tokens',
];

export const defaultResourcesInclude = {
  orders: ['token'],
  tokens: [],
};
