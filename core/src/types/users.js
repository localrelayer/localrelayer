// @flow

import type {
  ID,
} from '../types';


export type User = {
  id: ID,
  address: string,
  notifications: Array<*>
};
