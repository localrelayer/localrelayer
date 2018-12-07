// @flow
import * as actionTypes from './actionTypes';

export * as actionTypes from './actionTypes';
export * from './assets';
export * from './wallet';
export * from './socketClient';
export * from './orders';

export const sendNotificationRequest = config => ({
  type: actionTypes.SEND_NOTIFICATION,
  config,
});
