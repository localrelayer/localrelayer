// @flow
import createActionCreators from 'redux-resource-action-creators';
import {
  eventChannel,
} from 'redux-saga';
import * as eff from 'redux-saga/effects';
import type {
  Saga,
} from 'redux-saga';

import * as actionTypes from '../actions/actionTypes';


export function socketConnect(socketUrl): Promise<*> {
  console.log('_______');
  console.log('Socket connecting...', socketUrl);
  const socket = new WebSocket(socketUrl);
  return new Promise((resolve) => {
    socket.onerror = (err) => {
      console.log('Socket connect error');
      console.log(err);
      console.log('_______');
      resolve(socket);
    };
    socket.onopen = () => {
      console.log('Socket connected');
      console.log('_______');
      resolve(socket);
    };
  });
}

function subscribe(socket) {
  return eventChannel((emit) => {
    socket.onmessage = message => emit(message.data); /* eslint-disable-line */
    return () => {};
  });
}

function* read(socket) {
  const channel = yield eff.call(subscribe, socket);
  while (true) {
    const message = yield eff.take(channel);
    const data = JSON.parse(message);

    console.warn('Message from socket');
    console.log(data);

    if (data.channel === 'tradingInfo') {
      const tradingInfoActions = createActionCreators('read', {
        resourceType: 'tradingInfo',
        requestKey: 'socketTradingInfo',
        mergeListIds: true,
      });
      yield eff.put(tradingInfoActions.succeeded({
        resources: data.payload,
      }));
    }

    /*
    if (data.orders) {
      const resources = R.flatten(data.orders);
      const ordersActions = createActionCreators('read', {
        resourceType: 'orders',
        requestKey: 'orders',
        lists: ['tradingHistory'],
        mergeListIds: true,
        prepend: resources.length === 1,
      });
      yield eff.put(ordersActions.succeeded({
        resources: resources.map(r => ({
          id: r.orderHash,
          ...r,
        })),
      }));
    }
    */
  }
}

function* write(socket) {
  while (true) {
    const { message } = yield eff.take(actionTypes.SEND_SOCKET_MESSAGE);
    console.log('SEND SOCKET MESSAGE');
    console.log(message);
    socket.send(JSON.stringify(message));
  }
}

export function* handleSocketIO(socket): Saga<void> {
  yield eff.fork(read, socket);
  yield eff.fork(write, socket);
}
