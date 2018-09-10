// @flow
import io from 'socket.io-client';
import * as R from 'ramda';
import createActionCreators from 'redux-resource-action-creators';
import {
  eventChannel,
} from 'redux-saga';
import * as eff from 'redux-saga/effects';
import type {
  Saga,
} from 'redux-saga';

import * as actionTypes from '../actions/actionTypes';


export function sputnikConnect(socketUrl): Promise<*> {
  console.log('_______');
  console.log('Socket connecting', socketUrl);
  console.log('_______');
  const socket = io(socketUrl);
  return new Promise((resolve) => {
    socket.on('connect', () => {
      resolve(socket);
    });
  });
}

function subscribe(socket) {
  return eventChannel((emit) => {
    socket.on('message', (data) => {
      if (data) {
        emit(data);
      }
    });
    socket.on('disconnect', () => {
      console.warn('disconnect');
    });
    return () => {};
  });
}

function* read(socket) {
  const channel = yield eff.call(subscribe, socket);
  while (true) {
    const data = yield eff.take(channel);

    console.warn('Message from socket');
    console.log(data);

    if (data.tradingInfo) {
      const tradingInfoActions = createActionCreators('read', {
        resourceType: 'tradingInfo',
        requestKey: 'tradingInfo',
        mergeListIds: true,
      });
      yield eff.put(tradingInfoActions.succeeded({
        resources: data.tradingInfo.map(d => ({
          id: d.pair,
          ...d.tradingInfo,
        })),
      }));
    }

    if (data.orders) {
      console.log(data.orders);
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
  }
}

function* write(socket) {
  while (true) {
    const {
      message,
      data,
    } = yield eff.take(actionTypes.SEND_SOCKET_MESSAGE);
    socket.emit(message, data);
  }
}

export function* handleSputnikSocketIO(socket: any): Saga<void> {
  yield eff.fork(read, socket);
  yield eff.fork(write, socket);
}
