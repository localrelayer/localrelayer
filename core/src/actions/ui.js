import * as types from './types';

export function setCurrentToken({ address }) {
  return {
    type: types.SET_CURRENT_TOKEN,
    payload: address,
  };
}
