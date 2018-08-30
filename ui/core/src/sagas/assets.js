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

    // Create id field by meging assetData fields
    const assetPairs = response.records.map(
      pair => ({
        id: `${pair.assetDataA.assetData}_${pair.assetDataB.assetData}`,
        ...pair,
      }),
    );

    // TODO: Collect all assets(tokens) from pairs, get additional info
    // about this tokens and place it to the reducers as assets resource
    // using includeResources
    yield put(actions.succeeded({
      resources: assetPairs,
      includedResources: {
        assets: {
          '0xe41d2489571d322189246dafa5ebde1f4699f498': {
            address: '0xe41d2489571d322189246dafa5ebde1f4699f498',
            symbol: 'ZRX',
          },
        },
      },
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
