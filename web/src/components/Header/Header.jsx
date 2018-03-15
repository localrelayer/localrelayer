// @flow
import React from 'react';
import { withState } from 'recompose';

import type {
  Node,
} from 'react';
import type {
  User,
  Tokens,
  Token,
} from 'instex-core/types';
import {
  Link,
} from 'react-router-dom';
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
  UserButton,
  TokenContainer,
} from './styled';
import {
  Truncate,
} from '../SharedStyles';
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
  selectedToken: Token,
  /**
   * Function that is called whenever token select
   * */
  onTokenSelect: Function,
  /** Function that is called whenever pair select */
  onPairSelect: Function,
  /**
   * Function that is called whenever token is searched in table
   * */
  onTokenSearch: Function,
  /** Selected trading pair */
  tokenPair: Token,
    /** Is popover visible */
    popoverVisible: boolean,
    /** Toggle popover visibility */
    togglePopover: Function,
};

/**
 * Header
 * @version 1.0.0
 * @author [Tim Reznich](https://github.com/imbaniac)
 */

const enhance = withState('popoverVisible', 'togglePopover', false);

const Header = ({
  user,
  onUserClick,
  onTokenSelect,
  tokens,
  selectedToken,
  tokenPair,
  onTokenSearch,
  onPairSelect,
  popoverVisible,
  togglePopover,
}: Props): Node => (
  <HeaderContainer>
    <LogoContainer />
    <Popover
      trigger={['click']}
      placement="bottom"
      visible={popoverVisible}
      onVisibleChange={togglePopover}
      content={
        <TokenContainer>
          <TokensList
            onSearch={onTokenSearch}
            tokens={tokens}
            selectedToken={selectedToken}
            onSelect={(token) => {
              togglePopover(false);
              onTokenSelect(token);
            }}
            tokenPair={tokenPair}
            onPairSelect={onPairSelect}
          />
        </TokenContainer>
      }
    >
      <HeaderButton type="primary">
        Tokens ({`${selectedToken.symbol}/${tokenPair.symbol}`}) <Icon type="down" />
      </HeaderButton>
    </Popover>
    <MenuContainer theme="dark" mode="horizontal">
      <Menu.Item key="home"><Link to="/ZRX-WETH">Home</Link></Menu.Item>
      <Menu.Item key="account"><Link to="/account">Account</Link></Menu.Item>
    </MenuContainer>
    <HeaderButton shape="circle" type="primary">
      <Icon type="question-circle" />
    </HeaderButton>
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
  onTokenSearch: () => {},
};

export default enhance(Header);
