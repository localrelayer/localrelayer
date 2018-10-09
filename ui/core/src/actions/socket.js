// @flow

import * as actionTypes from './actionTypes';
import type {
  SocketAction,
} from '../types';

export const sendSocketMessage = (
  message: string,
  data: any,
): SocketAction => {
  console.log(message, data);
  return {
    type: actionTypes.SEND_SOCKET_MESSAGE,
    message,
    data,
  };
};
