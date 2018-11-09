import chai from 'chai';
import {
  SchemaValidator,
  schemas,
} from '@0x/json-schemas';
import {
  request,
} from './utils';

const validator = new SchemaValidator();
const { expect } = chai;

describe('FeeRecipients', () => {
  it('should return valid response', async () => {
    const response = await request
      .get('/v2/fee_recipients');

    expect(
      validator.isValid(
        response.body,
        schemas.relayerApiFeeRecipientsResponseSchema,
      ),
    ).to.equal(true);
  });
});
