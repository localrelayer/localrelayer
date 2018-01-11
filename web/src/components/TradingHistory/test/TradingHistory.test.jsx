import React from 'react';
import { shallow } from 'enzyme';
import { times } from 'ramda';
import TradingHistory from '../TradingHistory';
import OrdersList from '../../OrdersList';
import { generateTestOrders } from '../../../utils/mocks';

test('TradingHistory renders', () => {
  const component = shallow(<TradingHistory data={times(generateTestOrders, 50)} />);

  expect(component).toMatchSnapshot();
});

test('TradingHistory has OrderLists', () => {
  const component = shallow(<TradingHistory data={times(generateTestOrders, 50)} />);
  expect(component.find(OrdersList)).toHaveLength(1);
});
