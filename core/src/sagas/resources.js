import {
  takeEvery,
  call,
  put,
} from 'redux-saga/effects';
import createActionCreators from 'redux-resource-action-creators';

import {
  putData,
} from './utils';
import {
  apiCall,
} from '../api';
import * as resourcesActions from '../actions/resources';


export function* fetchResourcesRequest({
  payload: {
    resourceName,
    list,
    request,
    withDeleted,
    fetchQuery,
    additionalInclude,
    mergeListIds = true,
  },
}) {
  const actions = createActionCreators('read', {
    resourceName,
    request,
    list,
    mergeListIds,
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
  },
}) {
  try {
    const actions = createActionCreators(data.id ? 'update' : 'create', {
      resourceName,
      request,
      list,
    });
    if (data.id) {
      actions.resources = [data.id];
    }
    yield put(actions.pending());
    const response = yield call(apiCall, data.id ? 'UPDATE' : 'ADD', data);
    yield putData(response);
    yield put(actions.succeeded({
      resources: [response.data],
    }));
  } catch (err) {
    console.log(err);
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
    yield put(resourcesActions.deleteResourceItem({ resourceName, id }));
  } catch (err) {
    console.log(err);
  }
}

export function* listenDeleteResourceRequest() {
  yield takeEvery(action => /^@@JSONAPI\/.*_DELETE_REQUEST/.test(action.type), deleteResourceRequest);
}
