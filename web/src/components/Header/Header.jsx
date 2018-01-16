// @flow
import React from 'react';
import type { Node } from 'react';
import type { User } from 'instex-core/types';
import { Menu, Dropdown, Icon, Badge } from 'antd';
import {
  LogoContainer,
  MenuContainer,
  HeaderContainer,
  AlignRight,
  HeaderButton,
  Truncate,
  UserButton,
  TokenContainer,
} from './styled';
import TokensList from '../TokensList';
import { generateTestTokens } from '../../utils/mocks';

type Props = {
  /** User object */
  user: User,
  /** Function called on address click */
  onUserClick: Function,
};

/**
 * Header
 * @version 1.0.0
 * @author [Tim Reznich](https://github.com/imbaniac)
 */

const Header = ({ user, onUserClick }: Props): Node => (
  <HeaderContainer>
    <LogoContainer />
    <Dropdown
      trigger={['click']}
      overlay={
        <TokenContainer>
          <TokensList
            bordered={false}
            tokens={generateTestTokens()}
            onClick={record => console.log(record)}
          />
        </TokenContainer>
      }
    >
      <HeaderButton type="primary">
        Markets <Icon type="down" />
      </HeaderButton>
    </Dropdown>
    <MenuContainer theme="dark" mode="horizontal">
      <Menu.Item key="dashboard">Dashboard</Menu.Item>
      <Menu.Item key="help">Help</Menu.Item>
    </MenuContainer>
    <AlignRight>
      <Badge>
        <UserButton onClick={() => onUserClick(user)} type="primary">
          <Icon type="user" />
          {user.address ? <Truncate>{user.address}</Truncate> : 'Not connected'}
        </UserButton>
      </Badge>
      <Badge count={user.notifications ? user.notifications.length : 0}>
        <HeaderButton shape="circle" type="primary">
          <Icon type="bell" />
        </HeaderButton>
      </Badge>
    </AlignRight>
  </HeaderContainer>
);

Header.defaultProps = {
  user: {},
};

export default Header;