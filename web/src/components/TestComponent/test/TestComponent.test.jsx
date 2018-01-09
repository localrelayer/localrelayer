import React from 'react';
import { shallow } from 'enzyme';
import TestComponent from '../TestComponent';

test('Button renders', () => {
  const component = shallow(<TestComponent />);

  expect(component).toMatchSnapshot();
});
