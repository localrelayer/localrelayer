import * as types from '../actions/types';

const initialState = {
  isLoading: false,
  address: '',
  balance: '',
  tokens: [],
  connectionStatus: '',
  network: '',
};

export default function profileReducer(state = initialState, action) {
  switch (action.type) {
    case types.CHANGE_PROFILE_LOADING_STATE:
      return {
        ...state,
        isLoading: action.payload,
      };
    case types.SET_ADDRESS:
      return {
        ...state,
        address: action.payload,
      };
    case types.SET_BALANCE:
      return {
        ...state,
        balance: action.payload,
      };
    case types.SET_CONNECTION_STATUS:
      return {
        ...state,
        connectionStatus: action.payload,
      };
    case types.SET_CURRENT_NETWORK:
      return {
        ...state,
        network: action.payload,
      };
    case types.CLEAR_ALL_REDUCERS:
      return initialState;
    default:
      return state;
  }
}
