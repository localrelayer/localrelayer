import {
  takeEvery,
  call,
  all,
  put,
} from 'redux-saga/effects';
import createActionCreators from 'redux-resource-action-creators';

import {
  actionTypes,
} from '../actions';
import api from '../api';


export function* fetchAssetPairs() {
  const actions = createActionCreators('read', {
    resourceType: 'assetPairs',
    requestKey: 'assetPairs',
    list: 'assetPairs',
    mergeListIds: true,
  });
  try {
    yield put(actions.pending());

    const firsPageResponse = yield call(
      api.getAssetPairs,
      {
        perPage: 1000,
      },
    );
    const perPage = firsPageResponse.records.length;
    const restPagesResponses = yield all(
      Array(
        Math.ceil(firsPageResponse.total / perPage),
      )
        .fill(null)
        .map(
          (item, index) => (
            call(api.getAssetPairs, {
              page: index + 1,
              perPage,
            })
          ),
        )
        .slice(1),
    );
    const records = [
      ...firsPageResponse.records,
    ].concat(
      ...restPagesResponses.map(r => r.records),
    );
    // Create id field by merging assetData fields
    const assetPairs = records.map(
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
