import {
  takeEvery,
  call,
  put,
} from 'redux-saga/effects';
import createActionCreators from 'redux-resource-action-creators';

import {
  actionTypes,
} from '../actions';
import api from '../api';


export function* fetchAssetPairs({ query }) {
  const actions = createActionCreators('read', {
    resourceType: 'assetPairs',
    requestKey: 'assetPairs',
    list: 'assetPairs',
    mergeListIds: true,
  });
  try {
    yield put(actions.pending());
    // TODO: fetch all pages using all
    const response = yield call(
      api.getAssetPairs,
      query,
    );
    console.log('=====');
    console.log(query);
    console.log(response);
    console.log('=====');

    yield put(actions.succeeded({
      resources: response.records,
    }));
  } catch (err) {
    console.log(err);
    yield put(actions.succeeded({
      resources: [],
    }));
  }
}

export function* takeFetchAssetPairsRequest() {
  yield takeEvery(
    actionTypes.FETCH_ASSET_PAIRS_REQUEST,
    fetchAssetPairs,
  );
}
