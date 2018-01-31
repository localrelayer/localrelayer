import * as types from '../actions/types';

const initialState = {
  currentPairId: null,
  currentTokenId: null,
  searchQuery: '',
  isBalanceLoading: false,
};

export default function ui(state = initialState, action) {
  switch (action.type) {
    case types.SET_CURRENT_TOKEN:
      return {
        ...state,
        currentTokenId: action.payload,
      };
    case types.SET_CURRENT_PAIR:
      return {
        ...state,
        currentPairId: action.payload,
      };
    case types.SET_SEARCH_QUERY:
      return {
        ...state,
        searchQuery: action.payload,
      };
    case types.SET_BALANCE_LOADING:
      return {
        ...state,
        isBalanceLoading: action.payload,
      };
    case types.CLEAR_ALL_REDUCERS:
      return initialState;
    default:
      return state;
  }
}
