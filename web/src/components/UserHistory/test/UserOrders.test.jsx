import React from 'react';
import { shallow, mount } from 'enzyme';
import { times } from 'ramda';
import UserHistory, { getColumns } from '../UserHistory';
import OrdersList from '../../OrdersList';
import { generateTestOrders } from '../../../utils/mocks';

test('UserHistory renders', () => {
  const component = shallow(<UserHistory data={times(generateTestOrders, 50)} />);
  expect(component).toMatchSnapshot();
});

test('UserHistory has OrderLists', () => {
  const component = shallow(<UserHistory data={times(generateTestOrders, 50)} />);
  expect(component.find(OrdersList)).toHaveLength(1);
});

test('UserHistory onCancel works', () => {
  const onClick = jest.fn();
  const testData = times(generateTestOrders, 50);
  const component = mount(
    <OrdersList data={testData} title="Test" columns={getColumns(onClick)} onClick={onClick} />,
  );
  component
    .find('.cancel')
    .at(0)
    .simulate('click');
  expect(onClick).toHaveBeenCalled();
  expect(onClick).toBeCalledWith(testData[0]);
});
