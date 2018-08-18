import React from 'react';
import { shallow } from 'enzyme';
import TradingHistory from '../TradingHistory';
import OrdersList from '../../OrdersList';
import { generateTestOrders } from '../../../utils/mocks';

test('TradingHistory renders', () => {
  const component = shallow(<TradingHistory data={generateTestOrders()} />);

  expect(component).toMatchSnapshot();
});

test('TradingHistory has OrderLists', () => {
  const component = shallow(<TradingHistory data={generateTestOrders()} />);
  expect(component.find(OrdersList)).toHaveLength(1);
});
