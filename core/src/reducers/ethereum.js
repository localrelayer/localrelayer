import * as actionTypes from '../actions/types';

const defaultState = {
  web3: {},
};

export default (state = defaultState, action) => {
  switch (action.type) {
    case actionTypes.SET_WEB3:
      return { ...state, web3: action.payload };
    default:
      return state;
  }
};
