import sinon from 'sinon';
import {
  coreSagas,
  api,
  coreMocks,
  coreReducers,
} from 'instex-core';
import {
  runSaga,
} from 'redux-saga';
import {
  combineReducers,
} from 'redux';
import {
  expectSaga,
} from 'redux-saga-test-plan';

api.setApiUrl('http://testSaga');
api.setMockMethods({
  getAssetPairs(args) {
    return new Promise(r => r(coreMocks.getAssetPairs(args.queryParameters)));
  },
});
const reducer = combineReducers({
  assets: coreReducers.assets,
  assetPairs: coreReducers.assetPairs,
});

const baseAssetAddress = '0xe41d2489571d322189246dafa5ebde1f4699f498'; /* ZRX */
const quoteAssetAddress = '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2'; /* WETH */

describe('fetchAssetPair', () => {
  xit('should dispatch pending at the beginning and succeeded in the end of saga', async () => {
    // it should be array with pending and succeed actions
    const dispatched = [];
    const saga = await
    runSaga({
      dispatch: action => dispatched.push(action),
      getState: () => ({}),
    }, coreSagas.fetchAssetPairs).toPromise();
    expect(dispatched[0].type === 'READ_RESOURCES_PENDING').toBe(true);
    expect(dispatched[dispatched.length - 1].type === 'READ_RESOURCES_SUCCEEDED').toBe(true);
  });

  xit('should check if store was modified and received passed values', async () => {
    const initState = {};
    const { storeState } = await expectSaga(
      coreSagas.fetchAssetPairs,
      {
        assetDataA: baseAssetAddress,
        assetDataB: quoteAssetAddress,
      },
    )
      .withReducer(reducer)
      .withState(initState)
      .run();
    expect(initState).not.toMatchObject(storeState);
    expect(storeState.assets.resources).toHaveProperty(baseAssetAddress);
    expect(storeState.assets.resources).toHaveProperty(quoteAssetAddress);
    expect(storeState.assetPairs.resources)
      .toHaveProperty(`${baseAssetAddress}_${quoteAssetAddress}`);
  });
});

describe('fetchAssetPair pagination', () => {
  xit('should check getAssetPairs was called correct number of times and with appropriate arguments', async () => {
    const assetPairs = await api.getAssetPairs({ perPage: 1 });
    const perPage = 10;
    const pagesCount = Math.ceil(assetPairs.total / perPage);
    const spy = sinon.spy(api, 'getAssetPairs');
    const saga = await
    runSaga({
      dispatch: () => ({}),
      getState: () => ({}),
    }, coreSagas.fetchAssetPairs, {
      perPage,
    }).toPromise();
    expect(spy.firstCall.calledWith({
      perPage,
    })).toBe(true);
    expect(spy.callCount).toBe(pagesCount);
    expect(spy.lastCall.calledWith({
      perPage,
      page: pagesCount,
    })).toBe(true);
    spy.restore();
  });

  xit('should check getAssetPairs was called only once if perPage > total', async () => {
    const assetPairs = await api.getAssetPairs({ perPage: 1 });
    // ensure that perPage > total
    const perPage = assetPairs.total + 1;
    const spy = sinon.spy(api, 'getAssetPairs');
    const saga = await
    runSaga({
      dispatch: () => ({}),
      getState: () => ({}),
    }, coreSagas.fetchAssetPairs, {
      perPage,
    }).toPromise();
    expect(spy.firstCall.calledWith({
      perPage,
    })).toBe(true);
    expect(spy.calledOnce).toBe(true);
    spy.restore();
  });

  it('should check if api was called by call effect', async () => {
    //
  });
});
