// @flow

import * as types from '../actions/types';
import type {
  Action,
  ProfileState,
} from '../types';

const initialState: ProfileState = {
  isLoading: false,
  address: '',
  balance: '',
  tokens: [],
  connectionStatus: '',
  network: '',
};

export default function profileReducer(
  state: ProfileState = initialState,
  action: Action,
) {
  switch (action.type) {
    case types.SET_PROFILE_STATE:
      return {
        ...state,
        [action.payload.key]: action.payload.value,
      };
    case types.UPDATE_TOKEN: {
      const { tokenAddress, field, value } = action.payload;
      return {
        ...state,
        tokens: state.tokens.map(token => (
          token.id === tokenAddress ?
            ({ ...token, [field]: value })
            :
            token)),
      };
    }
    case types.CLEAR_ALL_REDUCERS:
      return initialState;
    default:
      return state;
  }
}
