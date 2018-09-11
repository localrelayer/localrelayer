import sinon from 'sinon';
import {
  runSaga,
} from 'redux-saga';
import {
  sagas,
} from 'instex-core';
import '../web3InitTests';

describe('getAdditionalInfo and extractInfo sagas', () => {
  it('should call methods: name, symbol and decimals then return correct additional info about token', async () => {
    const mock = {
      methods: {
        name: () => ({
          call: () => 'test-name',
        }),
        symbol: () => ({
          call: () => 'test-symbol',
        }),
        decimals: () => ({
          call: () => '18',
        }),
      },
    };
    const stub = sinon.stub(web3.eth, 'Contract').returns(mock);
    const spyOnName = sinon.spy(mock.methods, 'name');
    const spyOnSymbol = sinon.spy(mock.methods, 'symbol');
    const spyOnDecimals = sinon.spy(mock.methods, 'decimals');
    const saga = await runSaga({
      dispatch: action => action,
      getState: () => ({ state: 'test' }),
    },
    // use some random token which for sure is absent in cache file
    sagas.getAssetAdditionalInfo, '0x1234567890123456789012345678901234567890').done;
    expect(spyOnName.calledOnce).toBe(true);
    expect(spyOnSymbol.calledOnce).toBe(true);
    expect(spyOnDecimals.calledOnce).toBe(true);
    expect(saga).toMatchObject({
      id: '0x1234567890123456789012345678901234567890',
      address: '0x1234567890123456789012345678901234567890',
      name: 'test-name',
      symbol: 'test-symbol',
      decimals: 18,
    });
    stub.restore();
  });
  it('should call methods: name, symbol and decimals, return correct additional info about token if error with decoding was appear',
    async () => {
      const mock = {
        methods: {
          name: () => ({
            call: () => 'name',
          }),
          symbol: () => ({
            call: () => 'symbol',
          }),
          decimals: () => ({
            call: () => '10',
          }),
        },
      };
      /*
     alt means that we have some error while decoding, so we should
     use another approach in order to decode name and symbol
    */
      const altMock = {
        methods: {
          name: () => ({
            call: () => 'name-alt',
          }),
          symbol: () => ({
            call: () => 'symbol-alt',
          }),
          decimals: () => ({
            call: () => '18',
          }),
        },
      };
      sinon.stub(web3.eth, 'Contract')
        .onFirstCall()
        .returns(mock)
        .onSecondCall()
        .returns(altMock);
      sinon.stub(mock.methods, 'name').throws('some decoding error');
      sinon.stub(web3.utils, 'hexToAscii')
        .onFirstCall()
        .returns('NAME-decoded')
        .onSecondCall()
        .returns('SYMBOL-decoded');
      const spyOnName = sinon.spy(altMock.methods, 'name');
      const spyOnSymbol = sinon.spy(altMock.methods, 'symbol');
      const spyOnDecimals = sinon.spy(altMock.methods, 'decimals');
      const saga = await runSaga({
        dispatch: action => action,
        getState: () => ({ state: 'test' }),
      },
      // use some random token which for sure is absent in cache file
      sagas.getAssetAdditionalInfo, '0x1234567890123456789012345678901234567890').done;
      expect(spyOnName.calledOnce).toBe(true);
      expect(spyOnSymbol.calledOnce).toBe(true);
      expect(spyOnDecimals.calledOnce).toBe(true);
      // here we expect capitalized NAME and SYMBOL, because they were changed by hexToAscii
      expect(saga).toMatchObject({
        id: '0x1234567890123456789012345678901234567890',
        address: '0x1234567890123456789012345678901234567890',
        name: 'NAME-decoded',
        symbol: 'SYMBOL-decoded',
        decimals: 18,
      });
    });
});
