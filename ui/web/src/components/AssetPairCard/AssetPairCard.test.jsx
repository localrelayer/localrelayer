import React from 'react';
import renderer from 'react-test-renderer';

import AssetPairCard from './AssetPairCard';
import {
  assetPair,
} from './stories';

test('AssetPairCard component', () => {
  expect(
    renderer.create(
      <AssetPairCard assetPair={assetPair} />,
    ).toJSON(),
  ).toMatchSnapshot();

  /* Empty */
  expect(
    renderer.create(
      <AssetPairCard />,
    ).toJSON(),
  ).toMatchSnapshot();
});
