import React from 'react';
import renderer from 'react-test-renderer';

import NetworkNotSupported from './NetworkNotSupported';


test('NetworkNotSupported component', () => {
  expect(
    renderer.create(
      <NetworkNotSupported />,
    ).toJSON(),
  ).toMatchSnapshot();
});
