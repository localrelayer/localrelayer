import * as types from './types';

export const setWeb3 = web3 => ({
  type: types.SET_WEB3,
  payload: web3,
});

export const callContract = ({ method, contract }) => ({
  type: types.CALL_CONTRACT,
  payload: { method, contract },
});

export const setAllowance = ({ token }) => ({
  type: types.SET_ALLOWANCE,
  payload: token,
});

