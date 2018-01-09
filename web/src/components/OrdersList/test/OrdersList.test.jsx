import React from 'react';
import { shallow } from 'enzyme';
import { times } from 'ramda';
import OrdersList from '../OrdersList';

const generateTestData = key => ({
  key,
  price: '0.00005',
  amount: '4330.00',
  total: '0.2165',
});
test('OrderList renders', () => {
  const component = shallow(<OrdersList data={times(generateTestData, 50)} />);

  expect(component).toMatchSnapshot();
});
