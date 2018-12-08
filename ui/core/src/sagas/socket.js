// @flow
import createActionCreators from 'redux-resource-action-creators';
import {
  eventChannel,
} from 'redux-saga';
import * as eff from 'redux-saga/effects';
import type {
  Saga,
} from 'redux-saga';


function newMessageChannelCreator(socket) {
  return eventChannel((emit) => {
    socket.onmessage = message => emit(message.data); /* eslint-disable-line */
    return () => {};
  });
}

function openConnectionChannelCreator(socket) {
  return eventChannel((emit) => {
    socket.onopen = ev => emit(ev); /* eslint-disable-line */
    return () => {};
  });
}

function closeConnectionChannelCreator(socket) {
  return eventChannel((emit) => {
    socket.onclose = ev => emit(ev); /* eslint-disable-line */
    socket.onerror = (data) => emit(data); /* eslint-disable-line */
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

function* write(
  socket,
  messageChannel,
  closeSocketChannel,
) {
  const openConnectionChannel = yield eff.call(openConnectionChannelCreator, socket);
  yield eff.take(openConnectionChannel);
  while (true) {
    const { message } = yield eff.take(messageChannel);
    console.log('SEND SOCKET MESSAGE');
    console.log(message);
    if (socket.readyState === 1) {
      socket.send(JSON.stringify(message));
    } else {
      yield eff.put(
        closeSocketChannel,
        {
          resendMessage: message,
        },
      );
    }
  }
}

function* takeCloseConnection(
  socket,
  reportChannel,
): Saga<void> {
  const closeConnectionChannel = closeConnectionChannelCreator(socket);
  while (true) {
    yield eff.take(closeConnectionChannel);
    yield eff.put(reportChannel, 'close');
  }
}

function* takeReadWrite({
  socket,
  socketChannel,
  closeSocketChannel,
  messageChannel,
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
    messageChannel,
    closeSocketChannel,
  );
}

export function* handleSocketIO({
  socket,
  socketChannel,
  closeSocketChannel,
  messageChannel,
}): Saga<void> {
  yield eff.fork(
    takeReadWrite,
    {
      socket,
      socketChannel,
      closeSocketChannel,
      messageChannel,
    },
  );
  yield eff.fork(
    takeCloseConnection,
    closeSocketChannel,
  );
}
