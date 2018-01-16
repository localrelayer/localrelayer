import {
  put,
  all,
} from 'redux-saga/effects';
import {
  jsonApiNormalize,
} from '../utils';
import {
  fillResourceItems,
} from '../actions/resource';


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
