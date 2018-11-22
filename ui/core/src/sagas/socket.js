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


function newMessageChannelCreator(socket) {
  return eventChannel((emit) => {
    socket.onmessage = message => emit(message.data); /* eslint-disable-line */
    return () => {};
  });
}

function* read({
  socket,
  socketChannel,
}) {
  const newMessageChannel = yield eff.call(newMessageChannelCreator, socket);
  while (true) {
    const message = yield eff.take(newMessageChannel);
    const data = JSON.parse(message);

    console.warn('Message from socket');
    console.log(data);
    yield eff.put(
      socketChannel,
      data,
    );

    if (data.channel === 'tradingInfo') {
      const tradingInfoActions = createActionCreators('read', {
        resourceType: 'tradingInfo',
        requestKey: 'socketTradingInfo',
      });
      yield eff.put(tradingInfoActions.succeeded({
        resources: data.payload,
      }));
    }
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

function* takeReadWrite({
  socket,
  socketChannel,
}): Saga<void> {
  yield eff.fork(
    read,
    {
      socket,
      socketChannel,
    },
  );
  yield eff.fork(
    write,
    socket,
  );
}

export function* handleSocketIO({
  socket,
  socketChannel,
}): Saga<void> {
  const task = yield eff.fork(
    takeReadWrite,
    {
      socket,
      socketChannel,
    },
  );
  return [
    task,
    eventChannel((emit) => {
      socket.onclose = (data) => emit(data); /* eslint-disable-line */
      socket.onerror = (data) => emit(data); /* eslint-disable-line */
      return () => {
        socket.close();
      };
    }),
  ];
}
