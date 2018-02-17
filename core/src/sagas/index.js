// @flow
import {
  fork,
} from 'redux-saga/effects';

import {
  initialize,
} from './initialize';

import {
  listenFetchResourceRequest,
  listenSaveResourceRequest,
  listenDeleteResourceRequest,
} from './resources';

import {
  listenCallContract,
} from './ethereum';

import {
  listenNewOrder,
  listenCancelOrder,
} from './orders';

const coreSagas = [
  fork(initialize),
  fork(listenFetchResourceRequest),
  fork(listenDeleteResourceRequest),
  fork(listenSaveResourceRequest),
  fork(listenCallContract),
  fork(listenNewOrder),
  fork(listenCancelOrder),
];

export default coreSagas;
