import {
  SchemaValidator,
  schemas,
} from '@0xproject/json-schemas';
import {
  cachedTokens,
} from 'instex-core';


const tokens = Object.values(cachedTokens.default).map(item => ({
  id: item.address,
  ...item,
}));
const validator = new SchemaValidator();

describe('tokens', () => {
  it('each token should have a valid schema', () => {
    // https://github.com/0xProject/0x-monorepo/blob/development/packages/json-schemas/schemas/token_schema.ts
    const isTokensCorrect = tokens.every(
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
