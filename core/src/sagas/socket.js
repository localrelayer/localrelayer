// @flow
import io from 'socket.io-client';
import {
  eventChannel,
} from 'redux-saga';
import {
  fork,
  take,
  call,
} from 'redux-saga/effects';
import type {
  Saga,
} from 'redux-saga';

import * as actionTypes from '../actions/types';
import config from '../config';


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
    console.log('Message from socket');
    console.log(data);
    // Here we can put action for example
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
