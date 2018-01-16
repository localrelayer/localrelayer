import config from '../config';
import {
  defaultResourcesInclude,
} from '../constants';


export function saveResource({
  id,
  relationships,
  attributes,
  resourceName,
}) {
  const isCreation = id === undefined;
  const idData = isCreation ? {} : { id };
  const requestData = {
    data: {
      ...idData,
      type: resourceName,
      attributes,
      relationships,
    },
  };
  return fetch({
    url: `${config.apiUrl}/${resourceName}${isCreation ? '' : `/${id}`}`,
    meta: {
      method: isCreation ? 'POST' : 'PATCH',
      body: JSON.stringify(requestData),
    },
  });
}

export function removeResource({ id, resourceName }) {
  return fetch({
    url: `${config.apiUrl}/${resourceName}/${id}`,
    meta: { method: 'DELETE' },
  });
}

export function fetchResources({
  sortBy = 'id',
  sortDirection = '',
  withDeleted = false,
  limitCondition = {},
  offsetCondition = {},
  filterCondition = {},
  additionalInclude,
  resourceName,
}) {
  const pageConditionObject = {
    page: {
      ...limitCondition,
      ...offsetCondition,
    },
  };
  const includeCondition = additionalInclude
    ? { include: defaultResourcesInclude[resourceName].concat(additionalInclude) }
    : {};

  const pageCondition = pageConditionObject.page ? pageConditionObject : {};
  const requestData = {
    withDeleted,
    ...pageCondition,
    ...filterCondition,
    ...includeCondition,
    sort: [
      `${sortDirection}${sortBy}`,
    ],
  };
  return fetch({
    url: `${config.apiUrl}/${resourceName}/filter`,
    meta: {
      method: 'POST',
      body: JSON.stringify(requestData),
    },
  });
}

export function apiCall(action, data) {
  switch (action) {
    case 'ADD':
    case 'UPDATE':
      return saveResource(data, fetch, config.apiUrl);
    case 'DELETE':
      return removeResource(data, fetch);
    case 'FILTER':
      return fetchResources(data, fetch);
    default:
      return null;
  }
}
