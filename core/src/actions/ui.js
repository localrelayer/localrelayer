// @flow
import * as actionTypes from './types';
import type { UiAction } from '../types';

export const setUiState = (
  key: string,
  value: any,
): UiAction => ({
  type: actionTypes.SET_UI_STATE,
  payload: {
    key,
    value,
  },
});

export const sendNotification = (
  payload: {
    message: string,
    type: string,
  },
): UiAction => ({
  type: actionTypes.SEND_NOTIFICATION,
  payload,
});

export const fillField = (
  field: string,
  values: any,
): UiAction => ({
  type: actionTypes.FILL_FIELD,
  payload: values,
  meta: {
    field,
  },
});
