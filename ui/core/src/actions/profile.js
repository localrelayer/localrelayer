// @flow

import * as types from './types';
import type { ProfileAction } from '../types';

export const setProfileState = (
  key: string,
  value: any,
): ProfileAction => ({
  type: types.SET_PROFILE_STATE,
  payload: {
    key,
    value,
  },
});

export const changeProvider = (
  provider: string,
): ProfileAction => ({
  type: types.CHANGE_PROVIDER,
  payload: {
    provider,
  },
});

export const setAddress = (
  address: string,
): ProfileAction => ({
  type: types.SET_ADDRESS,
  payload: {
    address,
  },
});

export const loadUser = (): ProfileAction => ({ type: types.LOAD_USER });
