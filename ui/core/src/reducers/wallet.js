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
  state,
) => (
  Object.keys(values).reduce((s, v) => ({
    ...s,
    [v]: values[v]._merge ? ({ /* eslint-disable-line */
      ...state[v],
      ...values[v],
    }) : (
      values[v]
    ),
  }), {})
);

const wallet = (
  state: WalletState = initialState,
  action: Action,
) => {
  switch (action.type) {
    case actionTypes.SET_WALLET_STATE: {
      const {
        keyOrRootValues,
        maybeValues,
      } = action.payload;
      const [
        values,
        key,
      ] = (
        maybeValues === undefined
          ? [
            keyOrRootValues,
            null,
          ]
          : [
            maybeValues,
            keyOrRootValues,
          ]
      );
      return {
        ...state,
        ...(
          key
            ? ({
              [key]: {
                ...state[key],
                ...mergeValues(
                  values,
                  state[key],
                ),
              },
            })
            : (
              mergeValues(
                values,
                state,
              )
            )
        ),
      };
    }
    default:
      return state;
  }
};

export default wallet;
