// @flow
import io from 'socket.io-client';
import { actionTypes as reduxResourceActions } from 'redux-resource';
import {
  eventChannel,
} from 'redux-saga';
import {
  fork,
  take,
  call,
  put,
  select,
} from 'redux-saga/effects';
import type {
  Saga,
} from 'redux-saga';

import * as actionTypes from '../actions/types';
import * as resourcesActions from '../actions/resources';
import config from '../config';
import {
  sendNotification,
} from '../actions';
import { getResourceItemBydId } from '../selectors';


export function socketConnect() {
  const socket = io(config.socketUrl);
  return new Promise((resolve) => {
    socket.on('connect', () => {
      resolve(socket);
    });
  });
}

function subscribe(socket) {
  return eventChannel((emit) => {
    socket.on('new_message', (data) => {
      emit(data);
    });
    socket.on('disconnect', () => {
      console.log('disconnect');
    });
    return () => {};
  });
}

function* read(socket) {
  const channel = yield call(subscribe, socket);
  while (true) {
    const data = yield take(channel);
    console.warn('Message from socket');
    console.log(data);
    if (data.matchedIds) {
      yield put(
        resourcesActions.fetchResourcesRequest({
          resourceName: 'orders',
          request: 'fetchUpdatedMatchedOrders',
          lists: ['buy', 'sell', 'completedOrders', 'userOrders'],
          prepend: true,
          withDeleted: false,
          fetchQuery: {
            filterCondition: {
              filter: {
                'id': {
                  in: data.matchedIds,
                },
                'canceled_at': null,
                'deleted_at': null,
              },
            },
            sortBy: '-created_at',
          },
        }),
      );
      yield put(sendNotification({ message: 'Found matched order', type: 'success' }));
    } else if (data.tradingInfo) {
      const token = yield select(getResourceItemBydId('tokens', data.token));
      console.log(token);
      yield put({
        type: reduxResourceActions.UPDATE_RESOURCES_SUCCEEDED,
        resourceName: 'tokens',
        resources: [{
          ...token,
          attributes: {
            ...token.attributes,
            tradingInfo: data.tradingInfo,
          },
        }],
      });
    }
  }
}

function* write(socket) {
  while (true) {
    const {
      message,
      data,
    } = yield take(actionTypes.SEND_SOCKET_MESSAGE);
    socket.emit(message, data);
  }
}

export function* handleSocketIO(socket: any): Saga<void> {
  yield fork(read, socket);
  yield fork(write, socket);
}
