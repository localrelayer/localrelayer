// @flow
import type {
  WalletAction,
} from '../types';

import {
  actionTypes,
} from '.';

export const setWalletState = (
  values: any,
  deepMergeKeys: Array<string> = [],
): UiAction => ({
  type: actionTypes.SET_WALLET_STATE,
  payload: {
    values,
  },
  meta: {
    deepMergeKeys,
  },
});
