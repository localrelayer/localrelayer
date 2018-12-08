// @flow
import type {
  WalletAction,
} from '../types';

import {
  actionTypes,
} from '.';

export const setWalletState = (
  keyOrRootValues: any,
  maybeValues: any,
): WalletAction => ({
  type: actionTypes.SET_WALLET_STATE,
  payload: {
    keyOrRootValues,
    maybeValues,
  },
});
