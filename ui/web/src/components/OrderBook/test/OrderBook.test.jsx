import React from 'react';
import { shallow } from 'enzyme';
import OrderBook from '../OrderBook';
import OrdersList from '../../OrdersList';
import { generateTestOrders } from '../../../utils/mocks';

test('OrderBook renders', () => {
  const component = shallow(<OrderBook data={generateTestOrders()} />);
  expect(component).toMatchSnapshot();
});

test('OrderBook has two OrderLists', () => {
  const component = shallow(<OrderBook data={generateTestOrders()} />);
  expect(component.find(OrdersList)).toHaveLength(2);
});
