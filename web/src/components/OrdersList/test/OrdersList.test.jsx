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

const columns = [
  {
    title: 'Price',
    dataIndex: 'price',
    key: 'price',
  },
  {
    title: 'Amount',
    dataIndex: 'amount',
    key: 'amount',
  },
  {
    title: 'Total',
    dataIndex: 'total',
    key: 'total',
  },
];

test('OrderList renders', () => {
  const component = shallow(<OrdersList data={times(generateTestData, 50)} columns={columns} />);
  expect(component).toMatchSnapshot();
});

test('OrdersList with title', () => {
  const component = shallow(
    <OrdersList data={times(generateTestData, 50)} title="Test" columns={columns} />,
  );
  expect(component).toMatchSnapshot('titel', 'Test');
});
