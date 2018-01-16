import * as types from './types';

export const setWeb3 = web3 => ({
  type: types.SET_WEB3,
  payload: web3,
});
