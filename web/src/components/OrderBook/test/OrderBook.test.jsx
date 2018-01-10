import React from 'react';
import { shallow } from 'enzyme';
import { times } from 'ramda';
import OrderBook from '../OrderBook';
import OrdersList from '../../OrdersList';
import { generateTestOrders } from '../../../utils/mocks';

test('OrderBook renders', () => {
  const component = shallow(<OrderBook data={times(generateTestOrders, 50)} />);
  expect(component).toMatchSnapshot();
});

test('OrderBook has two OrderLists', () => {
  const component = shallow(<OrderBook data={times(generateTestOrders, 50)} />);
  expect(component.find(OrdersList)).toHaveLength(2);
});
