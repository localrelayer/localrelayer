import sinon from 'sinon';
import {
  runSaga,
} from 'redux-saga';
import {
  coreSagas,
  contracts,
  coreCache,
} from 'instex-core';

import '../../web3InitTests';


const UNEXIST_IN_CACHE_ASSET = '0x1234567890123456789012345678901234567890';
const networkId = 1;
const tokens = Object.values(coreCache.cachedTokens[networkId]).map(item => ({
  id: item.address,
  ...item,
}));
const getWeb3ContractMock = ({
  name,
  symbol,
  decimals,
}) => ({
  methods: {
    name: () => ({
      call: () => name,
    }),
    symbol: () => ({
      call: () => symbol,
    }),
    decimals: () => ({
      call: () => decimals,
    }),
  },
});

describe('getAssetAdditionalInfo saga', () => {
  it('should return asset info from cache file', () => {
    const testAsset = tokens[0];

    const gen = coreSagas.getAssetAdditionalInfo({
      assetData: testAsset.address,
      networkId,
    });
    const result = gen.next();

    expect(result.done).toBe(true);
    expect(result.value).toEqual(testAsset);
  });

  it('should use web3 api with ZRX ABI contract for unknown address', async () => {
    const name = 'testName';
    const symbol = 'testSymbol';
    const decimals = 18;
    const web3ContractMock = getWeb3ContractMock({
      name,
      symbol,
      decimals,
    });
    const stubWeb3ContractApi = sinon.stub(web3.eth, 'Contract').returns(web3ContractMock);
    const spyContract = [
      'name',
      'symbol',
      'decimals',
    ].reduce((acc, method) => ({
      ...acc,
      [method]: sinon.spy(web3ContractMock.methods, method),
    }), {});

    const saga = await runSaga(
      {
        dispatch: () => ({}),
        getState: () => ({}),
      },
      coreSagas.getAssetAdditionalInfo,
      {
        assetData: UNEXIST_IN_CACHE_ASSET,
        networkId,
      },
    ).toPromise();

    expect(stubWeb3ContractApi.calledOnce).toBe(true);
    expect(stubWeb3ContractApi.calledWith(contracts.abiZRX, UNEXIST_IN_CACHE_ASSET)).toBe(true);
    expect(spyContract.name.calledOnce).toBe(true);
    expect(spyContract.symbol.calledOnce).toBe(true);
    expect(spyContract.decimals.calledOnce).toBe(true);

    expect(saga).toEqual({
      id: UNEXIST_IN_CACHE_ASSET,
      address: UNEXIST_IN_CACHE_ASSET,
      name,
      symbol,
      decimals,
    });
    stubWeb3ContractApi.restore();
  });

  it('should use web3 api with EOS ABI contract if ZRX will throw an error', async () => {
    const web3ContractMock = getWeb3ContractMock({
      name: '',
      symbol: '',
      decimals: '18',
    });
    sinon.stub(web3ContractMock.methods, 'name').throws('Error using ZRX ABI');

    const web3EosContractMock = getWeb3ContractMock({
      /* Alt mock name */
      name: '0x416c74206d6f636b206e616d65',
      /* Alt */
      symbol: '0x416c74',
      decimals: '18',
    });
    const stubWeb3ContractApi = sinon.stub(web3.eth, 'Contract')
      .onFirstCall()
      .returns(web3ContractMock)
      .onSecondCall()
      .returns(web3EosContractMock);
    const spyContract = [
      'name',
      'symbol',
      'decimals',
    ].reduce((acc, method) => ({
      ...acc,
      [method]: sinon.spy(web3EosContractMock.methods, method),
    }), {});

    const saga = await runSaga(
      {
        dispatch: () => ({}),
        getState: () => ({}),
      },
      coreSagas.getAssetAdditionalInfo,
      {
        assetData: UNEXIST_IN_CACHE_ASSET,
        networkId,
      },
    ).toPromise();

    expect(stubWeb3ContractApi.calledTwice).toBe(true);
    expect(stubWeb3ContractApi.calledWith(contracts.abiZRX, UNEXIST_IN_CACHE_ASSET)).toBe(true);
    expect(stubWeb3ContractApi.calledWith(contracts.abiEOS, UNEXIST_IN_CACHE_ASSET)).toBe(true);
    expect(spyContract.name.calledOnce).toBe(true);
    expect(spyContract.symbol.calledOnce).toBe(true);
    expect(spyContract.decimals.calledOnce).toBe(true);

    expect(saga).toEqual({
      id: UNEXIST_IN_CACHE_ASSET,
      address: UNEXIST_IN_CACHE_ASSET,
      name: 'Alt mock name',
      symbol: 'Alt',
      decimals: 18,
    });
  });
});
