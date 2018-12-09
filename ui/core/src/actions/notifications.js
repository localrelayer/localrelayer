// @flow
import * as actionTypes from './actionTypes';


export const sendNotificationRequest = config => ({
  type: actionTypes.SEND_NOTIFICATION_REQUEST,
  config,
});
