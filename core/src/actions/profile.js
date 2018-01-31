// @flow
import * as types from './types';
import type { Tokens } from '../types';

export function loadUser() {
  return { type: types.LOAD_USER };
}

export function setAddress(address: string) {
  return { type: types.SET_ADDRESS, payload: address };
}

export function setBalance(balance: string) {
  return { type: types.SET_BALANCE, payload: balance };
}

export function changeProfileLoadingState(state: boolean) {
  return {
    type: types.CHANGE_PROFILE_LOADING_STATE,
    payload: state,
  };
}

export function setConnectionStatus(status: string) {
  return {
    type: types.SET_CONNECTION_STATUS,
    payload: status,
  };
}

export function setCurrentNetwork(network: string) {
  return {
    type: types.SET_CURRENT_NETWORK,
    payload: network,
  };
}

export function setTokens(tokens: Tokens) {
  return {
    type: types.SET_TOKENS,
    payload: tokens,
  };
}

type UpdateToken = {
  tokenAddress: string,
  field: string,
  value: any
}

export function updateToken({ tokenAddress, field, value }: UpdateToken) {
  return {
    type: types.UPDATE_TOKEN,
    payload: { tokenAddress, field, value },
  };
}
