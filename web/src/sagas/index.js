import {
  all,
} from 'redux-saga/effects';
import {
  coreSagas,
} from 'instex-core';

export default function* rootSaga() {
  yield all([
    ...coreSagas,
  ]);
}
