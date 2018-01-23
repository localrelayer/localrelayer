import * as types from '../actions/types';

const initialState = {
  currentTokenId: null,
};

export default function ui(state = initialState, action) {
  switch (action.type) {
    case types.SET_CURRENT_TOKEN:
      return {
        ...state,
        currentTokenId: action.payload,
      };
    case types.CLEAR_ALL_REDUCERS:
      return initialState;
    default:
      return state;
  }
}
