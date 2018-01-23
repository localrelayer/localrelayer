// @flow
import React from 'react';

import type {
  Node,
} from 'react';
import type {
  User,
  Tokens,
} from 'instex-core/types';

import {
  connectionStatuses,
} from 'instex-core/src/utils/web3';

import {
  Menu,
  Popover,
  Icon,
  Badge,
} from 'antd';
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
import TokensList from './TokensList';
import UserProfile from '../UserProfile';


type Props = {
  /** User object */
  user: User,
  /** Function called on address click */
  onUserClick: Function,
  /** Array of tokens */
  tokens: Tokens,
  /** Selected token */
  selectedTokenId: ?string,
  /**
   * Function that is called whenever token select
   * */
  onTokenSelect: Function,

};

/**
 * Header
 * @version 1.0.0
 * @author [Tim Reznich](https://github.com/imbaniac)
 */

const Header = ({
  user,
  onUserClick,
  onTokenSelect,
  tokens,
  selectedTokenId,
}: Props): Node => (
  <HeaderContainer>
    <LogoContainer />
    <Popover
      trigger={['click']}
      placement="bottom"
      content={
        <TokenContainer>
          <TokensList
            tokens={tokens}
            selectedTokenId={selectedTokenId}
            onSelect={onTokenSelect}
          />
        </TokenContainer>
      }
    >
      <HeaderButton type="primary">
        Markets <Icon type="down" />
      </HeaderButton>
    </Popover>
    <MenuContainer theme="dark" mode="horizontal">
      <Menu.Item key="dashboard">Dashboard</Menu.Item>
      <Menu.Item key="help">Help</Menu.Item>
    </MenuContainer>
    <AlignRight>
      <Popover
        placement="bottom"
        trigger={['click']}
        content={
          <div>
            <UserProfile {...user} />
          </div>
        }
      >
        <Badge>
          <UserButton onClick={() => onUserClick(user)} type="primary">
            <Icon type="user" />{' '}
            {user.connectionStatus === connectionStatuses.CONNECTED ? (
              <Truncate>{user.address}</Truncate>
            ) : (
              user.connectionStatus
            )}
            <Icon type="down" />
          </UserButton>
        </Badge>
      </Popover>
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
  onUserClick: () => {},
};

export default Header;
