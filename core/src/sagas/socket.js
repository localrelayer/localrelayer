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
  setUiState,
} from '../actions';
import {
  getResourceItemBydId,
} from '../selectors';
import {
  loadUserOrders,
  loadBalance,
  loadCurrentTokenAndPairBalance,
} from './profile';

export function socketConnect() {
  console.log('_______');
  console.log(config.socketUrl);
  console.log('_______');
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
          lists: ['buy', 'sell', 'completedOrders'],
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
      yield call(loadUserOrders);
      yield call(loadBalance);
      yield call(loadCurrentTokenAndPairBalance);
    } else if (data.tradingInfo) {
      const token = yield select(getResourceItemBydId('tokens', data.token));
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

    if (data.message) {
      yield put(sendNotification({ message: data.message, type: 'success' }));
    }

    if (data.txHash) {
      yield put(setUiState('activeModal', 'TxModal'));
      yield put(setUiState('txHash', data.txHash));
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
