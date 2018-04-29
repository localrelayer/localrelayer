// @flow

import * as types from '../actions/types';
import type {
  Action,
  ProfileState,
} from '../types';

const initialState: ProfileState = {
  isLoading: false,
  socketConnected: false,
  address: '',
  balance: '',
  tokens: [],
  connectionStatus: '',
  network: '',
  provider: '',
  addresses: [],
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
    case types.CLEAR_ALL_REDUCERS:
      return initialState;
    default:
      return state;
  }
}
