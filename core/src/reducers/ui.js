import * as types from '../actions/types';

const initialState = {
  currentToken: null,
};

export default function ui(state = initialState, action) {
  switch (action.type) {
    case types.SET_CURRENT_TOKEN:
      return {
        ...state,
        currentToken: action.payload,
      };
    case types.CLEAR_ALL_REDUCERS:
      return initialState;
    default:
      return state;
  }
}
