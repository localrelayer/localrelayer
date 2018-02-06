import * as types from '../actions/types';

const initialState = {
  currentPairId: null,
  currentTokenId: null,
  searchQuery: '',
  isBalanceLoading: false,
};

export default function ui(state = initialState, action) {
  switch (action.type) {
    case types.SET_UI_STATE:
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
