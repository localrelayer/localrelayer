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
  fillOrKillOrders,
} from '../actions';
import {
  getResourceItemBydId,
  getUiState,
} from '../selectors';
import {
  loadUserOrders,
  loadBalance,
  loadCurrentTokenAndPairBalance,
} from './profile';

export function socketConnect(): Promise<*> {
  console.log('_______');
  console.log('Socket connecting', config.socketUrl);
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
      console.warn('disconnect');
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

    const currentTokenId = yield select(getUiState('currentTokenId'));

    if (data.matchedIds && data.token === currentTokenId) {
      yield fork(loadUpdatedOrders, data.matchedIds);
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

    if (data.matchedOrders) {
      yield put(fillOrKillOrders(data.matchedOrders, data.order));
    }
  }
}

function* loadUpdatedOrders(matchedIds) {
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
              in: matchedIds,
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
