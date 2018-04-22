// @flow
import React from 'react';
import {
  withState,
  compose,
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
  NavLink,
} from 'react-router-dom';
import pathToRegexp from 'path-to-regexp';

import {
  // Menu,
  Popover,
  Icon,
  Badge,
  Modal,
  Alert,
  Button,
} from 'antd';
import {
  LinksContainer,
  HeaderContainer,
  HeaderButton,
  UserButton,
  TokenContainer,
  PriceContainer,
} from './styled';
import {
  AlignRight,
} from '../SharedStyles';
import TokensList from './TokensList';
import UserProfile from '../UserProfile';
import CustomTokenForm from './CustomTokenForm';
import logo from '../../assets/logo5.png';

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
  /** Is modal visible */
  modalVisible: boolean,
  /** Toggle modal visibility */
  toggleModal: Function,
  /** Set custom token address */
  setTokenAddress: Function,
  /** Check if we can submit form in modal */
  isCustomTokenFormValid: Boolean,
  /** Called when eth address changed */
  onAddressSelect: Function,
  /** Called when eth provider changed */
  onProviderSelect: Function,
  ethPrice: string,
};

/**
 * Header
 * @version 1.0.0
 * @author [Tim Reznich](https://github.com/imbaniac)
 */

const checkIsActiveToken = (match, location) => {
  const { pathname } = location;
  const reg = pathToRegexp('/:token-:pair');
  const [a, token, pair] = reg.exec(pathname) || []; // eslint-disable-line
  return token && pair;
};

const checkIsActiveAccount = (match, location) => location.pathname === '/account';

const enhancePopover = withState('popoverVisible', 'togglePopover', false);
const enhanceModal = withState('modalVisible', 'toggleModal', false);

const getTokenButtonTitle = (selectedToken: Token, tokenPair: Token) => {
  if (selectedToken.symbol && tokenPair.symbol) {
    return `(${selectedToken.symbol}/${tokenPair.symbol})`;
  }
  return '';
};

const Header = ({
  user,
  tokens,
  selectedToken,
  tokenPair,
  onTokenSearch,
  onTokenSelect,
  onPairSelect,
  popoverVisible,
  togglePopover,
  onHelpClick,
  modalVisible,
  toggleModal,
  setTokenAddress,
  isCustomTokenFormValid,
  onAddressSelect,
  onProviderSelect,
  ethPrice,
  // eslint-disable-next-line
  location, // we need to location to see changes
}: Props): Node => (
  <div>
    <label htmlFor="show-menu" className="show-menu">
      <Link
        to="/ZRX-WETH"
        style={{
          height: '50px',
        }}
      >
        <img alt="logo" src={logo} />
      </Link>
      <Icon style={{ fontSize: '2rem' }} type="bars" />
    </label>
    <input type="checkbox" id="show-menu" role="button" />
    <HeaderContainer id="menu">
      <Link
        id="main-header-logo"
        style={{
          height: '100%',
        }}
        to="/ZRX-WETH"
      >
        <img alt="logo" src={logo} />
      </Link>
      <LinksContainer>
        <NavLink
          isActive={match => checkIsActiveToken(match, location)}
          activeStyle={{ color: 'white' }}
          to="/ZRX-WETH"
        >
          <Icon type="swap" />Trade
        </NavLink>
        <NavLink
          isActive={match => checkIsActiveAccount(match, location)}
          activeStyle={{ color: 'white' }}
          to="/account"
        >
          <Icon type="home" />Account
        </NavLink>
      </LinksContainer>
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
                onTokenSelect(token.symbol);
              }}
              selectedToken={selectedToken}
              tokenPair={tokenPair}
              onPairSelect={onPairSelect}
            />
          </TokenContainer>
        }
      >
        <UserButton id="selectTokenButton" type="primary">
          Tokens {getTokenButtonTitle(selectedToken, tokenPair)} <Icon type="down" />
        </UserButton>
      </Popover>
      <UserButton onClick={() => toggleModal(true)} type="primary">
        Token by Address <Icon type="copy" />
      </UserButton>
      <Modal
        title="Trade not listed token"
        visible={modalVisible}
        destroyOnClose
        onCancel={() => toggleModal(false)}
        footer={[
          <Button type="default" key="back" onClick={() => toggleModal(false)}>
            Cancel
          </Button>,
          <Button
            key="submit"
            type="primary"
            onClick={
              isCustomTokenFormValid &&
              (() => {
                setTokenAddress();
                toggleModal(false);
              })
            }
          >
            Submit
          </Button>,
        ]}
      >
        <Alert
          message="Double check that you want to trade precisely this address"
          description="There are a lot of scam tokens. Difference even in 1 symbol can cost you money."
          type="info"
        />
        <CustomTokenForm />
      </Modal>
      <AlignRight id="right-menu">
        <PriceContainer>
          ETH PRICE: ${ethPrice || '0.00'}
        </PriceContainer>
        <UserProfile
          {...user}
          onAddressSelect={onAddressSelect}
          onProviderSelect={onProviderSelect}
        />
        <div>
          { /*
          <Popover
            placement="bottom"
            trigger={['click']}
            content={<div style={{ padding: '12px 16px' }}>No notifications</div>}
          >
            <Badge count={user.notifications ? user.notifications.length : 0}>
              <HeaderButton icon="bell" shape="circle" type="primary" />
            </Badge>
          </Popover>
          */ }
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
        </div>
      </AlignRight>
    </HeaderContainer>
  </div>
);

Header.defaultProps = {
  user: {},
  onUserClick: () => {},
  onTokenSearch: () => {},
  onHelpClick: () => {},
  setActiveLink: () => {},
};

export default compose(enhancePopover, enhanceModal)(Header);
