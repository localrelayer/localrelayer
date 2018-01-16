import * as types from '../actions/types';

const initialState = {
  isLoading: true,
  address: '',
  balance: '',
  tokens: [],
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
    case types.CLEAR_ALL_REDUCERS:
      return initialState;
    default:
      return state;
  }
}
