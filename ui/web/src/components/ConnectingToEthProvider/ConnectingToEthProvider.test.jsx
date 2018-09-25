import React from 'react';
import renderer from 'react-test-renderer';

import ConnectingToEthProvider from './ConnectingToEthProvider';


test('ConnectingToEthProvider component', () => {
  expect(
    renderer.create(
      <ConnectingToEthProvider />,
    ).toJSON(),
  ).toMatchSnapshot();
});
