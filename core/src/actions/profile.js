import * as types from './types';

export function loadUser() {
  return { type: types.LOAD_USER };
}

export function setAddress({ address }) {
  return { type: types.SET_ADDRESS, payload: address };
}

export function setBalance({ balance }) {
  return { type: types.SET_BALANCE, payload: balance };
}

export function changeProfileLoadingState(state) {
  return {
    type: types.CHANGE_PROFILE_LOADING_STATE,
    payload: state,
  };
}

export function setConnectionStatus(status) {
  return {
    type: types.SET_CONNECTION_STATUS,
    payload: status,
  };
}

export function setCurrentNetwork(network) {
  return {
    type: types.SET_CURRENT_NETWORK,
    payload: network,
  };
}
