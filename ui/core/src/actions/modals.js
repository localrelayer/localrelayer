// @flow
import * as actionTypes from './actionTypes';

export const sendShowModalRequest = modalName => ({
  type: actionTypes.SHOW_MODAL_REQUEST,
  modalName,
});

export const checkModalStatus = isConfirmed => ({
  type: actionTypes.CHECK_MODAL_STATUS,
  isConfirmed,
});
