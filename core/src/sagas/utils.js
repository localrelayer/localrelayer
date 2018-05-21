import {
  put,
  all,
} from 'redux-saga/effects';
import Raven from 'raven-js';
import {
  jsonApiNormalize,
} from '../utils';
import {
  fillResourceItems,
} from '../actions/resources';


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
