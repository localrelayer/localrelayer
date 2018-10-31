import chai from 'chai';
import {
  SchemaValidator,
  schemas,
} from '@0xproject/json-schemas';
import {
  request,
} from './utils';

const validator = new SchemaValidator();
const { expect } = chai;

const assetDataA = '0xf47261b00000000000000000000000000e8d6b471e332f140e7d9dbb99e5e3822f728da6';
const assetDataB = '0xf47261b0000000000000000000000000c02aaa39b223fe8d0a0e5c4f27ead9083c756cc2';

describe('AssetPairs', () => {
  it('should return valid assetPairs response', async () => {
    const response = await request
      .get('/v2/asset_pairs');

    expect(
      validator.isValid(
        response.body,
        schemas.relayerApiAssetDataPairsResponseSchema,
      ),
    ).to.equal(true);
  });

  it('should return assetPairs filtered by assetDataA', async () => {
    const response = await request
      .get('/v2/asset_pairs')
      .query({
        assetDataA,
      });
    const { records } = response.body;

    expect(
      records.every(
        record => record.assetDataA.assetData === assetDataA,
      ),
    ).to.equal(true);
  });

  it('should return assetPairs filtered by assetDataB', async () => {
    const response = await request
      .get('/v2/asset_pairs')
      .query({
        assetDataB,
      });
    const { records } = response.body;

    expect(
      records.every(
        record => record.assetDataB.assetData === assetDataB,
      ),
    ).to.equal(true);
  });

  it('should return assetPairs filtered by both assetDataA and assetDataB', async () => {
    const response = await request
      .get('/v2/asset_pairs')
      .query({
        assetDataA,
        assetDataB,
      });
    const { records } = response.body;

    expect(
      records.every(
        record => record.assetDataA.assetData === assetDataA,
      ),
    ).to.equal(true);
    expect(
      records.every(
        record => record.assetDataB.assetData === assetDataB,
      ),
    ).to.equal(true);
  });

  it('should return correctly paginated records', async () => {
    const page = 3;
    const perPage = 2;
    const firstResponse = await request
      .get('/v2/asset_pairs')
      .query({
        page,
        perPage,
      });
    const secondResponse = await request
      .get('/v2/asset_pairs')
      .query({
        page: 5,
        perPage: 1,
      });
    const firstResponseRecords = firstResponse.body.records;
    const secondResponseRecords = secondResponse.body.records;

    expect(firstResponseRecords[0]).to.eql(secondResponseRecords[0]);
    expect(firstResponseRecords.length).to.equal(perPage);
  });

  it('should return correctly paginated records with filtering', async () => {
    const page = 3;
    const perPage = 2;
    const firstResponse = await request
      .get('/v2/asset_pairs')
      .query({
        page,
        perPage,
        assetDataB,
      });
    const secondResponse = await request
      .get('/v2/asset_pairs')
      .query({
        page: 5,
        perPage: 1,
        assetDataB,
      });
    const firstResponseRecords = firstResponse.body.records;
    const secondResponseRecords = secondResponse.body.records;

    expect(firstResponseRecords[0]).to.eql(secondResponseRecords[0]);
    expect(firstResponseRecords.length).to.equal(perPage);
  });
});
