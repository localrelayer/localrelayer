import React from 'react';
import { shallow, mount } from 'enzyme';
import TokenCard from '../TokenCard';
import { testToken } from '../../../utils/mocks';

test('TokenCard renders', () => {
  const component = shallow(<TokenCard token={testToken} />);
  expect(component).toMatchSnapshot();
});

test('TokenCard onClick works', () => {
  const onClick = jest.fn();

  const component = mount(<TokenCard token={testToken} onClick={onClick} />);
  component.find('#watch-btn').simulate('click');
  expect(onClick).toHaveBeenCalled();
});
