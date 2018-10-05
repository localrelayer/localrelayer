import {
  SchemaValidator,
  schemas,
} from '@0xproject/json-schemas';
import {
  coreCache,
} from 'instex-core';


const mainNet = 1;
const kovanNet = 42;
const getTokens = networkId => (
  Object.values(coreCache.cachedTokens[networkId]).map(item => ({
    id: item.address,
    ...item,
  }))
);
const validator = new SchemaValidator();

describe('tokens', () => {
  it('each main net token should have a valid schema', () => {
    // https://github.com/0xProject/0x-monorepo/blob/development/packages/json-schemas/schemas/token_schema.ts
    const isTokensCorrect = getTokens(mainNet).every(
      item => (
        validator.validate(
          item,
          schemas.tokenSchema,
        )
          .errors.length === 0
      ),
    );
    expect(isTokensCorrect).toBe(true);
  });

  it('each kovan net token should have a valid schema', () => {
    const isTokensCorrect = getTokens(kovanNet).every(
      item => (
        validator.validate(
          item,
          schemas.tokenSchema,
        )
          .errors.length === 0
      ),
    );
    expect(isTokensCorrect).toBe(true);
  });
});
