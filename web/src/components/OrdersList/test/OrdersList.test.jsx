import React from 'react';
import { shallow, mount } from 'enzyme';
import { times } from 'ramda';
import OrdersList from '../OrdersList';

const generateTestData = key => ({
  key,
  price: '0.00005',
  amount: '4330.00',
  total: '0.2165',
});

const testData = times(generateTestData, 50);

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
  const component = shallow(<OrdersList data={testData} columns={columns} />);
  expect(component).toMatchSnapshot();
});

test('OrdersList with title', () => {
  const component = shallow(<OrdersList data={testData} title="Test" columns={columns} />);
  expect(component).toMatchSnapshot('titel', 'Test');
});

test('OrdersList onClick', () => {
  const onClick = jest.fn();

  const component = mount(
    <OrdersList data={testData} title="Test" columns={columns} onClick={onClick} />,
  );
  component
    .find('.ant-table-row')
    .at(0)
    .simulate('click');
  expect(onClick).toHaveBeenCalled();
  expect(onClick).toBeCalledWith(testData[0], 0);
});
