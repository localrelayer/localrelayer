import * as types from './types';

export const setWeb3 = web3 => ({
  type: types.SET_WEB3,
  payload: web3,
});

export const callContract = payload => ({
  type: types.CALL_CONTRACT,
  payload,
});

export const setAllowance = ({ token }) => ({
  type: types.SET_ALLOWANCE,
  payload: token,
});

