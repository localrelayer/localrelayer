import {
  expectSaga,
} from 'redux-saga-test-plan';
import {
  combineReducers,
} from 'redux';
import {
  api,
  coreMocks,
  coreSagas,
  coreReducers,
} from 'localrelayer-core';

import '../../web3InitTests';


const networkId = 1;
const baseAssetData = '0xf47261b0000000000000000000000000e41d2489571d322189246dafa5ebde1f4699f498'; /* ZRX */
const quoteAssetData = '0xf47261b0000000000000000000000000c02aaa39b223fe8d0a0e5c4f27ead9083c756cc2'; /* WETH */
const assetPairId = `${baseAssetData}_${quoteAssetData}`;

describe('checkAssetPair saga', () => {
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

  describe('with listed ZRX/WETH pair, should return with isListed: true', () => {
    let state = {};

    /* prepare store, fetch assetPairs */
    beforeAll(async () => {
      const { storeState } = await expectSaga(
        coreSagas.fetchAssetPairs,
        {
          assetDataA: baseAssetData,
          assetDataB: quoteAssetData,
          networkId,
        },
      )
        .withReducer(reducer)
        .run();
      state = storeState;
    });

    it('should find and return assetPair resource in store by addresses', async () => {
      const {
        returnValue,
        storeState: s,
      } = await expectSaga(
        coreSagas.checkAssetPair,
        {
          baseAsset: baseAssetData,
          quoteAsset: quoteAssetData,
          networkId,
        },
      )
        .withReducer(reducer)
        .withState(state)
        .run();

      expect(returnValue).toEqual({
        assetPair: s.assetPairs.resources[assetPairId],
        isListed: true,
      });
    });

    it('should find and return assetPair resource in store by symbols', async () => {
      const {
        returnValue,
        storeState: s,
      } = await expectSaga(
        coreSagas.checkAssetPair,
        {
          baseAsset: 'ZRX',
          quoteAsset: 'WETH',
          networkId,
        },
      )
        .withReducer(reducer)
        .withState(state)
        .run();

      expect(returnValue).toEqual({
        assetPair: s.assetPairs.resources[assetPairId],
        isListed: true,
      });
    });

    it('should find and return assetPair resource in store by symbol and address', async () => {
      const {
        returnValue,
        storeState: s,
      } = await expectSaga(
        coreSagas.checkAssetPair,
        {
          baseAsset: baseAssetData,
          quoteAsset: 'WETH',
          networkId,
        },
      )
        .withReducer(reducer)
        .withState(state)
        .run();

      expect(returnValue).toEqual({
        assetPair: s.assetPairs.resources[assetPairId],
        isListed: true,
      });
    });
  });

  /* saga will call getAssetAdditionalInfo to get unlisted pair assets */
  describe('with unlisted ZRX/WETH pair, should return with isListed: false', () => {
    it('should put unlisted assetPair resource in store and return it', async () => {
      const {
        returnValue,
        storeState: s,
      } = await expectSaga(
        coreSagas.checkAssetPair,
        {
          baseAsset: baseAssetData,
          quoteAsset: quoteAssetData,
          networkId,
        },
      )
        .withReducer(reducer)
        .run();

      expect(s.assetPairs.lists.notListed).toContain(assetPairId);
      expect(returnValue).toEqual({
        assetPair: s.assetPairs.resources[assetPairId],
        isListed: false,
      });
    });

    /* Tests below are skipped because they print error messages, despite they work properly
     * I didn't dig deeper in attampt to fix it, so at this moment it skipped
     *
     * https://github.com/jfairbank/redux-saga-test-plan/pull/212
     * https://github.com/jfairbank/redux-saga-test-plan/issues/147
     *
     */
    xit('should throw and error on unlisted asset symbol', async () => {
      try {
        await expectSaga(
          coreSagas.checkAssetPair,
          {
            baseAsset: 'ZRX',
            quoteAsset: 'WETH',
            networkId,
          },
        )
          .withReducer(reducer)
          .run();
      } catch (errors) {
        expect(errors).toEqual({
          baseAssetResource: 'Wrong asset',
          quoteAssetResource: 'Wrong asset',
        });
      }
    });

    xit('should throw and error on unlisted asset symbol and address', async () => {
      try {
        await expectSaga(
          coreSagas.checkAssetPair,
          {
            baseAsset: baseAssetData,
            quoteAsset: 'WETH',
            networkId,
          },
        )
          .withReducer(reducer)
          .run();
      } catch (errors) {
        expect(errors).toEqual({
          quoteAssetResource: 'Wrong asset',
        });
      }
    });


    xit('should throw and error on wrong asset symbol and address', async () => {
      try {
        await expectSaga(
          coreSagas.checkAssetPair,
          {
            baseAsset: '0xkasaksajdasjdaksdjkajdakj123131321321WRONG',
            quoteAsset: 'WETHWRONGWRONG',
            networkId,
          },
        )
          .withReducer(reducer)
          .run();
      } catch (errors) {
        expect(errors).toEqual({
          baseAssetResource: 'Wrong asset',
          quoteAssetResource: 'Wrong asset',
        });
      }
    });
  });
});
