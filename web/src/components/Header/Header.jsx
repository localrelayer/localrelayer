// @flow
import React from 'react';
import {
  withState,
} from 'recompose';

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
  Modal,
} from 'antd';
import {
  MenuContainer,
  HeaderContainer,
  AlignRight,
  HeaderButton,
  UserButton,
  TokenContainer,
  HelpButton,
  HelpContainer,
} from './styled';
import {
  Truncate,
} from '../SharedStyles';
import TokensList from './TokensList';
import UserProfile from '../UserProfile';
import logo from '../../assets/logo5.png';
import telegram from '../../assets/telegram.png';
import email from '../../assets/letter.png';
import twitter from '../../assets/twitter.png';

const Help = () => (
  <HelpContainer>
    <a target="_blank" rel="noopener noreferrer" href="https://t.me/instex">
      <img src={telegram} alt="telegram" />
      Telegram
    </a>
    <a href="mailto:hi@instex.io">
      <img src={email} alt="email" />
      Email
    </a>
    <a target="_blank" rel="noopener noreferrer" href="https://twitter.com/Instex_0x">
      <img src={twitter} alt="twitter" />
      Twitter
    </a>
  </HelpContainer>
);

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
  /** Change active link */
  setActiveLink?: Function,
  /** List of active strings */
  activeLink: string,
  /** Trigger help */
  onHelpClick?: Function,
};

/**
 * Header
 * @version 1.0.0
 * @author [Tim Reznich](https://github.com/imbaniac)
 */

const enhance = withState('popoverVisible', 'togglePopover', false);

const getTokenButtonTitle = (selectedToken: Token, tokenPair: Token) => {
  if (selectedToken.symbol && tokenPair.symbol) {
    return `(${selectedToken.symbol}/${tokenPair.symbol})`;
  }
  return '';
};

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
  setActiveLink,
  activeLink,
  onHelpClick,
}: Props): Node => (
  <HeaderContainer>
    <img
      alt="logo"
      src={logo}
      style={{
       height: '80%',
     }}
    />
    <MenuContainer
      theme="dark"
      mode="horizontal"
      onClick={setActiveLink}
      selectedKeys={[activeLink]}
    >
      <Menu.Item key="home">
        <Link to="/ZRX-WETH">
          <Icon type="swap" />Trade
        </Link>
      </Menu.Item>
      <Menu.Item id="account_link" key="account">
        <Link to="/account">
          <Icon type="home" />Account
        </Link>
      </Menu.Item>
    </MenuContainer>
    <Popover
      trigger={['click']}
      placement="bottom"
      visible={popoverVisible}
      onVisibleChange={togglePopover}
      content={
        <TokenContainer>
          <TokensList
            id="tokensList"
            onSearch={onTokenSearch}
            tokens={tokens}
            onSelect={(token) => {
              togglePopover(false);
              onTokenSelect(token);
            }}
            selectedToken={selectedToken}
            tokenPair={tokenPair}
            onPairSelect={onPairSelect}
          />
        </TokenContainer>
      }
    >
      <HeaderButton id="selectTokenButton" type="primary">
        Tokens {getTokenButtonTitle(selectedToken, tokenPair)} <Icon type="down" />
      </HeaderButton>
    </Popover>
    <AlignRight>
      <HelpButton
        onClick={() => Modal.info({ title: 'Contact us for help', content: Help() })}
      >Help
      </HelpButton>
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
          <UserButton
            id="account"
            type="primary"
            onClick={() => onUserClick(user)}
          >
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
      <Popover
        placement="bottom"
        trigger={['click']}
        content={
          <div style={{ padding: '12px 16px' }}>
            No notifications
          </div>
        }
      >
        <Badge count={user.notifications ? user.notifications.length : 0}>
          <HeaderButton icon="bell" shape="circle" type="primary" />
        </Badge>
      </Popover>
      <Badge>
        <HeaderButton
          id="help"
          style={{
            background: '#673ab7',
          }}
          shape="circle"
          type="primary"
          onClick={onHelpClick}
          icon="question-circle"
        />
      </Badge>
    </AlignRight>
  </HeaderContainer>
);

Header.defaultProps = {
  user: {},
  onUserClick: () => {},
  onTokenSearch: () => {},
  onHelpClick: () => {},
  setActiveLink: () => {},
};

export default enhance(Header);
