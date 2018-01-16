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
