import {
  put,
  all,
  call,
} from 'redux-saga/effects';
import Raven from 'raven-js';
import {
  jsonApiNormalize,
} from '../utils';
import {
  fillResourceItems,
} from '../actions/resources';
import config from '../config';

if (config.useSentry) {
  Raven.config('https://02469b8db8c94166a7cc5e9ea82f8d0a@sentry.io/1210496').install();
}

export function* putData(
  response,
  excludeList = [],
) {
  const normalizedData = jsonApiNormalize(response);
  const resourcesList =
    Object.keys(normalizedData)
      .filter(resource => excludeList.indexOf(resource) === -1)
      .sort((a, b) => b.localeCompare(a));
  yield all(resourcesList.map(resourceName => put(
    fillResourceItems({
      ...normalizedData[resourceName],
      resourceName,
    }),
  )));
  return normalizedData;
}

export function* throwError(err: any): Generator<*, void, *> {
  yield call(console.error, err);
  Raven.captureException(err);
}
