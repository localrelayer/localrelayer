// @flow

import type { ID } from '../types';

export type User = {
  id: ID,
  address: string,
  balance: string,
  tokens: Array<*>,
  notifications: Array<*>,
};
