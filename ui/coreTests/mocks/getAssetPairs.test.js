import {
  SchemaValidator,
  schemas,
} from '@0xproject/json-schemas';

import {
  coreMocks,
} from 'instex-core';

const validator = new SchemaValidator();

test('getAssetPairs: validate getAssetPairs response schema', () => {
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
  const assetDataA = '0xf47261b0000000000000000000000000c02aaa39b223fe8d0a0e5c4f27ead9083c756cc2';
  const assetPairs = coreMocks.getAssetPairs({
    assetDataA,
  }).records;
  assetPairs.forEach((pair) => {
    expect(pair.assetDataA.assetData)
      .toBe(assetDataA);
  });
});

test('getAssetPairs: filter by assetDataB field', () => {
  const assetDataB = '0xf47261b0000000000000000000000000b98d4c97425d9908e66e53a6fdf673acca0be986';
  const assetPairs = coreMocks.getAssetPairs({
    assetDataB,
  }).records;
  assetPairs.forEach((pair) => {
    expect(pair.assetDataB.assetData)
      .toBe(assetDataB);
  });
});

test('getAssetPairs: assetDataA and assetDataB fields simultaneously', () => {
  const assetPairs = coreMocks.getAssetPairs({
    assetDataA: '0xf47261b0000000000000000000000000c02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
    assetDataB: '0xf47261b00000000000000000000000009a794dc1939f1d78fa48613b89b8f9d0a20da00e',
  }).records;
  function AssetA(number) {
    return number === '0xf47261b0000000000000000000000000c02aaa39b223fe8d0a0e5c4f27ead9083c756cc2';
  }
  function AssetB(number) {
    return number === '0xf47261b00000000000000000000000009a794dc1939f1d78fa48613b89b8f9d0a20da00e';
  }
  const assetDataA = assetPairs.map(asset => asset.assetDataA.assetData);
  const assetDataB = assetPairs.map(asset => asset.assetDataB.assetData);
  expect(assetDataA.every(AssetA)).toBe(true);
  expect(assetDataB.every(AssetB)).toBe(true);
});
