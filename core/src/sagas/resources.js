import {
  takeEvery,
  call,
  put,
} from 'redux-saga/effects';
import createActionCreators from 'redux-resource-action-creators';

import {
  putData,
  throwError,
} from './utils';
import {
  apiCall,
} from '../api';
import {
  sendNotification,
  sendMessage,
  fillOrKillOrders,
  deleteResourceItem,
} from '../actions';


export function* fetchResourcesRequest({
  payload: {
    resourceName,
    list,
    lists,
    request,
    withDeleted,
    fetchQuery,
    additionalInclude,
    mergeListIds = true,
    prepend,
  },
}) {
  const actions = createActionCreators('read', {
    resourceName,
    request,
    list,
    lists,
    mergeListIds,
    prepend,
  });
  yield put(actions.pending());
  const response = yield call(apiCall, 'FILTER', {
    ...fetchQuery,
    additionalInclude,
    resourceName,
    withDeleted,
  });
  yield put(actions.succeeded({
    resources: response.data,
  }));
  return response;
}

export function* listenFetchResourceRequest() {
  yield takeEvery(action => /^@@JSONAPI\/.*_FETCH_REQUEST/.test(action.type), fetchResourcesRequest);
}


export function* saveResourceRequest({
  payload: {
    data,
    resourceName,
    list,
    request,
    lists,
    mergeResources,
    prepend,
  },
}) {
  try {
    const actions = createActionCreators(data.id ? 'update' : 'create', {
      resourceName,
      request,
      list,
      lists,
      mergeResources,
      prepend,
    });
    if (data.id) {
      actions.resources = [data.id];
    }
    yield put(actions.pending());
    const response = yield call(apiCall, data.id ? 'UPDATE' : 'ADD', data);
    yield put(sendMessage({ destroy: true }));

    if (resourceName === 'orders' && response.meta && response.meta.matchedOrders) {
      console.warn(response);
      yield put(fillOrKillOrders(data, response.meta.order, response.meta.matchedOrders));
      return response;
    }

    console.log(response);

    yield putData(response);
    yield put(actions.succeeded({
      resources: [response.data],
    }));

    return response;
  } catch (err) {
    yield call(throwError, err);
    yield put(sendNotification({
      message: `Couldn't ${data.id ? 'update' : 'create'}, try later`,
      type: 'error',
    }));
    console.log(err);
    return null;
  }
}

export function* listenSaveResourceRequest() {
  yield takeEvery(action => /^@@JSONAPI\/.*_SAVE_REQUEST/.test(action.type), saveResourceRequest);
}


export function* deleteResourceRequest({
  payload,
}) {
  const {
    resourceName,
    id,
  } = payload;
  try {
    yield call(apiCall, 'DELETE', { id, resourceName });
    yield put(deleteResourceItem({ resourceName, id }));
  } catch (err) {
    yield call(throwError, err);
    console.log(err);
  }
}

export function* listenDeleteResourceRequest() {
  yield takeEvery(action => /^@@JSONAPI\/.*_DELETE_REQUEST/.test(action.type), deleteResourceRequest);
}
