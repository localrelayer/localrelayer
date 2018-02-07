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

export const loadUser = (): ProfileAction => ({ type: types.LOAD_USER });

export const updateToken = (
  payload: {
    tokenAddress: string,
    field: string,
    value: any,
  },
): ProfileAction => ({
  type: types.UPDATE_TOKEN,
  payload,
});
