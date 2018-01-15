import React from 'react';
import { shallow, mount } from 'enzyme';
import UserBalance from '../UserBalance';
import { testTokens } from '../../../utils/mocks';

test('UserBalance renders', () => {
  const component = shallow(<UserBalance tokens={testTokens} />);
  expect(component).toMatchSnapshot();
});

test('UserBalance onToggle works', () => {
  const onToggle = jest.fn();

  const component = mount(<UserBalance tokens={testTokens} onToggle={onToggle} />);
  component
    .find('.ant-switch')
    .at(0)
    .simulate('click');
  expect(onToggle).toHaveBeenCalled();
  expect(onToggle).toBeCalledWith(testTokens[0]);
});

test('UserBalance onTokenClick works', () => {
  const onClick = jest.fn();

  const component = mount(<UserBalance tokens={testTokens} onTokenClick={onClick} />);
  component
    .find('.ant-table-row')
    .at(0)
    .simulate('click');
  expect(onClick).toHaveBeenCalled();
  expect(onClick).toBeCalledWith(testTokens[0]);
});
