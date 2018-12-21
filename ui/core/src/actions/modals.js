// @flow
import * as actionTypes from './actionTypes';

export const sendShowModalRequest = () => ({
  type: actionTypes.SHOW_ORDERS_MODAL,
});

export const checkModalStatus = ({ isConfirmed }) => ({
  type: actionTypes.CHECK_MODAL_STATUS,
  isConfirmed,
});
