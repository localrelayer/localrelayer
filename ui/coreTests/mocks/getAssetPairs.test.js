import {
  SchemaValidator,
  schemas,
} from '@0x/json-schemas';

import {
  coreMocks,
} from 'instex-core';

const assetDataA = '0xf47261b0000000000000000000000000e41d2489571d322189246dafa5ebde1f4699f498'; /* ZRX */
const assetDataB = '0xf47261b0000000000000000000000000c02aaa39b223fe8d0a0e5c4f27ead9083c756cc2'; /* WETH */

/*
 * ZRX/WETH
 * ZRX - makerAsset, baseAsset
 * WETH - takerAsset, quoteAsset
 *
*/

test('getAssetPairs: validate getAssetPairs response schema', () => {
  const validator = new SchemaValidator();
  const result = validator.validate(
    coreMocks.getAssetPairs({
      perPage: 1,
    }),
    schemas.relayerApiAssetDataPairsResponseSchema,
  );
  const { errors } = result;
  if (errors.length) {
    console.log(result);
  }

  expect(errors.length).toBe(0);
});

test('getAssetPairs: filter by assetDataA field', () => {
  const allAssetPairs = coreMocks.getAssetPairs({
    assetDataA,
  }).records;

  allAssetPairs.forEach((pair) => {
    expect(pair.assetDataA.assetData)
      .toBe(assetDataA);
  });
});

test('getAssetPairs: filter by assetDataB field', () => {
  const allAssetPairs = coreMocks.getAssetPairs({
    assetDataB,
  }).records;

  allAssetPairs.forEach((pair) => {
    expect(pair.assetDataB.assetData)
      .toBe(assetDataB);
  });
});

test('getAssetPairs: filter assetDataA and assetDataB fields simultaneously', () => {
  const allAssetPairs = coreMocks.getAssetPairs({
    assetDataA,
    assetDataB,
  }).records;
  const allAssetDataOfAssetDataA = allAssetPairs.map(asset => asset.assetDataA.assetData);
  const allAssetDataOfAssetDataB = allAssetPairs.map(asset => asset.assetDataB.assetData);

  expect(
    allAssetDataOfAssetDataA
      .every(
        number => (
          number === assetDataA
        ),
      ),
  ).toBe(true);
  expect(
    allAssetDataOfAssetDataB
      .every(
        number => (
          number === assetDataB
        ),
      ),
  ).toBe(true);
});

test('getAssetPairs: test pagination', () => {
  const allAssetPairs = coreMocks.getAssetPairs({
    page: 1,
    perPage: 2,
  });
  const page = 2;
  const perPage = 1;
  const paginatedAssetPairs = coreMocks.getAssetPairs({
    page,
    perPage,
  });
  const offsetToCheckLastPage = (page - 1) * perPage;
  const testRecordFromPage = paginatedAssetPairs.records[0];
  const testRecordFromAll = allAssetPairs.records[offsetToCheckLastPage];

  expect(testRecordFromPage).toMatchObject(testRecordFromAll);
  expect(paginatedAssetPairs.records.length).toBe(perPage);
});

test('getAssetPairs: test pagination with a filter', () => {
  const allAssetPairs = coreMocks.getAssetPairs({
    assetDataA,
    page: 1,
    perPage: 2,
  }).records;
  const page = 2;
  const perPage = 1;
  const paginatedAssetPairs = coreMocks.getAssetPairs({
    page,
    perPage,
    assetDataA,
  });
  const offsetToCheckLastPage = (page - 1) * perPage;
  const testRecordFromPage = paginatedAssetPairs.records[0];
  const testRecordFromAll = allAssetPairs[offsetToCheckLastPage];

  expect(testRecordFromPage).toMatchObject(testRecordFromAll);
  expect(paginatedAssetPairs.records.length).toBe(perPage);
});
