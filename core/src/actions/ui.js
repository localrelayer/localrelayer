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

export const sendMessage = (
  payload: {
    content: any,
    type: string,
    destroy: boolean,
  },
): UiAction => ({
  type: actionTypes.SEND_MESSAGE,
  payload,
});

export const showModal = (
  payload: {
    title: string,
    type: string,
    name?: string,
    text?: *,
  },
): UiAction => ({
  type: actionTypes.SHOW_MODAL,
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
