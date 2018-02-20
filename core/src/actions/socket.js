// @flow

import * as actionTypes from './types';
import type {
  SocketAction,
} from '../types';

export const sendSocketMessage = (
  message: string,
  data: any,
): SocketAction => ({
  type: actionTypes.SEND_SOCKET_MESSAGE,
  message,
  data,
});
