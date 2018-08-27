import React from 'react';
import { shallow, mount } from 'enzyme';
import TokenCard from '../TokenCard';
import { getTestToken } from '../../../utils/mocks';

test('TokenCard renders', () => {
  const component = shallow(<TokenCard token={getTestToken()} />);
  expect(component).toMatchSnapshot();
});

test('TokenCard onClick works', () => {
  const onClick = jest.fn();

  const component = mount(<TokenCard token={getTestToken()} onClick={onClick} />);
  component.find('#watch-btn').simulate('click');
  expect(onClick).toHaveBeenCalled();
});
