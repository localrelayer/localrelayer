// @flow

import * as actionTypes from './actionTypes';
import type {
  SocketClientAction,
} from '../types';


export const sendSocketMessage = (
  message: any,
): SocketClientAction => ({
  type: actionTypes.SEND_SOCKET_MESSAGE,
  message,
});
