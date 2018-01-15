import React from 'react';
import { shallow, mount } from 'enzyme';
import Header from '../Header';
import TokensList from '../../TokensList';

test('Header renders', () => {
  const component = shallow(<Header />);

  expect(component).toMatchSnapshot();
});

test('Header has TokenList', () => {
  const wrapper = mount(<Header />);
  expect(wrapper.contains(TokensList)).toBe(true);
});
