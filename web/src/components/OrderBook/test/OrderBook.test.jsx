import React from 'react';
import { shallow } from 'enzyme';
import { times } from 'ramda';
import OrderBook from '../OrderBook';
import OrdersList from '../../OrdersList';

const generateTestData = key => ({
  key,
  price: '0.00005',
  amount: '4330.00',
  total: '0.2165',
});

test('OrderBook renders', () => {
  const component = shallow(<OrderBook data={times(generateTestData, 50)} />);

  expect(component).toMatchSnapshot();
});

test('OrderBook has two OrderLists', () => {
  const component = shallow(<OrderBook data={times(generateTestData, 50)} />);
  expect(component.find(OrdersList)).toHaveLength(2);
});
