// @flow

import * as types from './types/ethereum';
import type { Token } from '../types';

export const callContract = (
  method: string,
  token: ?Token,
) => ({
  type: types.CALL_CONTRACT,
  payload: token,
  meta: {
    method,
  },
});
