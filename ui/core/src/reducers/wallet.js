// @flow
import {
  actionTypes,
} from '../actions';

import type {
  Action,
  WalletState,
} from '../types';


const initialState: WalletState = {
  networkId: null,
  networkName: '',
  selectedAccount: null,
  selectedAccountBalance: '0',
  accounts: [],
  balance: {},
  allowance: {},
};

const mergeValues = (
  values,
  deepMergeKeys,
  state,
) => (
  Object.keys(values).reduce((s, v) => ({
    ...s,
    [v]: deepMergeKeys.includes(v) ? {
      ...state[v],
      ...values[v],
    } : values[v],
  }), {})
);

const wallet = (
  state: WalletState = initialState,
  action: Action,
) => {
  switch (action.type) {
    case actionTypes.SET_WALLET_STATE: {
      const { values } = action.payload;
      const { deepMergeKeys } = action.meta;
      return {
        ...state,
        ...(mergeValues(
          values,
          deepMergeKeys,
          state,
        )),
      };
    }
    default:
      return state;
  }
};

export default wallet;
