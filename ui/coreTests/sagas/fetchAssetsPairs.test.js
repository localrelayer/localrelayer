import {
  SchemaValidator,
  schemas,
} from '@0xproject/json-schemas';
import {
  coreMocks,
} from 'instex-core';
import {
  api,
} from 'instex-core';
import {
  cachedTokens,
} from 'instex-core';
import {
  sagas,
} from 'instex-core';
import '../web3InitTests';

// https://github.com/0xProject/0x-monorepo/blob/development/packages/web3-wrapper/src/web3_wrapper.ts

const tokens = Object.values(cachedTokens.default).map(item => ({
  id: item.address,
  ...item,
}));

const validator = new SchemaValidator();

api.setApiUrl('http://someurl');
api.setMockMethods({
  getAssetPairs(args) {
    return new Promise(r => r(coreMocks.getAssetPairs(args.queryParameters)));
  },
});

describe('getAssetAdditionalInfo', () => {
  it('should return data from cache file', () => {
    /*
     checking if token has received from cache
     and generator finished working
    */
    const gen = sagas.getAssetAdditionalInfo(tokens[0].address);
    const result = gen.next();
    expect(result.value).toMatchObject(cachedTokens.default[tokens[0].address]);
    expect(result.done).toBe(true);
  });
  const tokenInfo = {
    name: 'token',
    decimals: '10',
    symbol: 'tokenSymbol',
  };
  it('should return token with correct structure and data typing', () => {
    // we use some random address it doesn't matter for this test
    const token = '0x1234567890123456789012345678901234567890';
    const gen = sagas.getAssetAdditionalInfo(token);
    gen.next();
    const result = gen.next(tokenInfo).value;
    expect(result).toMatchObject({
      id: token,
      address: token,
      name: expect.any(String),
      symbol: expect.any(String),
      decimals: expect.any(Number),
    });
  });

  it('should return token with correct structure and data typing if error was appear during execution', () => {
    // we use some random address it doesn't matter for this test
    const token = '0x0987654321098765432109876543210987654321';
    const gen = sagas.getAssetAdditionalInfo(token);
    gen.next();
    gen.throw();
    gen.next(tokenInfo);
    const result = gen.next({
      name: 'tokenDecodedName',
      symbol: 'tokenDecodedSymbol',
    }).value;
    expect(result).toMatchObject({
      id: token,
      address: token,
      name: expect.any(String),
      symbol: expect.any(String),
      decimals: expect.any(Number),
    });
  });
});

describe('tokenSchema', () => {
  it('should test if tokenSchema is valid', () => {
  // https://github.com/0xProject/0x-monorepo/blob/development/packages/json-schemas/schemas/token_schema.ts
    const isTokensCorrect = tokens.every(item => (validator.validate(
      item,
      schemas.tokenSchema,
    )
      .errors.length === 0));
    expect(isTokensCorrect).toBe(true);
  });
});
