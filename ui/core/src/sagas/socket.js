// @flow
import createActionCreators from 'redux-resource-action-creators';
import {
  eventChannel,
  channel,
} from 'redux-saga';
import * as eff from 'redux-saga/effects';
import type {
  Saga,
} from 'redux-saga';


function newMessageChannelCreator(socket) {
  return eventChannel((emit) => {
    function onMessage(message) {
      emit(message.data);
    }
    socket.addEventListener(
      'message',
      onMessage,
    );
    return () => {
      socket.removeEventListener(
        'message',
        onMessage,
      );
    };
  });
}

function openConnectionChannelCreator(socket) {
  return eventChannel((emit) => {
    function onOpen(ev) {
      emit(ev);
    }
    socket.addEventListener(
      'open',
      onOpen,
    );
    return () => {
      socket.removeEventListener(
        'open',
        onOpen,
      );
    };
  });
}

function closeConnectionChannelCreator(socket) {
  return eventChannel((emit) => {
    function onClose(ev) {
      emit(ev);
    }
    function onError(ev) {
      emit(ev);
    }
    socket.addEventListener(
      'close',
      onClose,
    );
    socket.addEventListener(
      'error',
      onError,
    );
    return () => {
      socket.removeEventListener(
        'close',
        onClose,
      );
      socket.removeEventListener(
        'error',
        onError,
      );
    };
  });
}

function* read({
  socket,
  messagesFromSocketChannel,
  pongChannel,
}) {
  const newMessageChannel = yield eff.call(newMessageChannelCreator, socket);
  while (true) {
    const message = yield eff.take(newMessageChannel);
    if (message === 'pong') {
      yield eff.put(
        pongChannel,
        message,
      );
    } else {
      const data = JSON.parse(message);
      console.warn('Message from socket');
      console.log(data);
      yield eff.put(
        messagesFromSocketChannel,
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
}

function* write(
  socket,
  messagesToSocketChannel,
  closeSocketChannel,
) {
  const openConnectionChannel = yield eff.call(openConnectionChannelCreator, socket);
  yield eff.take(openConnectionChannel);
  while (true) {
    const { message } = yield eff.take(messagesToSocketChannel);
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
  closeConnectionChannel,
  reportChannel,
): Saga<void> {
  while (true) {
    yield eff.take(closeConnectionChannel);
    yield eff.put(reportChannel, 'close');
  }
}

function* takeOpenConnection(
  socket,
  openConnectionChannel,
  reportChannel,
): Saga<void> {
  while (true) {
    yield eff.take(openConnectionChannel);
    yield eff.put(reportChannel, 'open');
  }
}

function* takeReadWrite({
  socket,
  messagesFromSocketChannel,
  closeSocketChannel,
  messagesToSocketChannel,
  pongChannel,
}): Saga<void> {
  yield eff.fork(
    read,
    {
      socket,
      messagesFromSocketChannel,
      pongChannel,
    },
  );
  yield eff.fork(
    write,
    socket,
    messagesToSocketChannel,
    closeSocketChannel,
  );
}

export function* handleSocketIO({
  socket,
  messagesFromSocketChannel,
  closeSocketChannel,
  openSocketChannel,
  messagesToSocketChannel,
}): Saga<void> {
  const pongChannel = yield eff.call(channel);
  const openConnectionChannel = yield eff.call(openConnectionChannelCreator, socket);
  const closeConnectionChannel = yield eff.call(closeConnectionChannelCreator, socket);
  yield eff.fork(
    takeReadWrite,
    {
      socket,
      messagesFromSocketChannel,
      closeSocketChannel,
      messagesToSocketChannel,
      pongChannel,
    },
  );
  yield eff.fork(
    takeCloseConnection,
    socket,
    closeConnectionChannel,
    closeSocketChannel,
  );
  yield eff.fork(
    takeOpenConnection,
    socket,
    openConnectionChannel,
    openSocketChannel,
  );
  yield eff.take(openConnectionChannel);
  while (true) {
    if (socket.readyState === 1) {
      socket.send('ping');
    }
    const raceResp = yield eff.race({
      pong: eff.take(pongChannel),
      notRespond: eff.delay(2000),
    });
    if (raceResp.notRespond) {
      yield eff.put(
        closeSocketChannel,
        'notRespond',
      );
    }
    yield eff.delay(2000);
  }
}
