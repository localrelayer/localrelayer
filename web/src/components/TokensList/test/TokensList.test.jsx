import React from 'react';
import { shallow } from 'enzyme';
import TokensList from '../TokensList';
import OrdersList from '../../OrdersList';
import { generateTestOrders } from '../../../utils/mocks';

test('TokensList renders', () => {
  const component = shallow(<TokensList data={generateTestOrders()} />);

  expect(component).toMatchSnapshot();
});

test('TokensList has OrderLists', () => {
  const component = shallow(<TokensList data={generateTestOrders()} />);
  expect(component.find(OrdersList)).toHaveLength(1);
});
