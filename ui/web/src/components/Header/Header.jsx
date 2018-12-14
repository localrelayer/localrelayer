// @flow
import React from 'react';
import {
  Link,
} from 'react-router-dom';
import {
  Button,
  Tooltip,
  Tag,
  Icon,
} from 'antd';
import {
  utils,
} from 'instex-core';

import * as S from './styled';
import logo from '../../assets/logo5.png';

type Props = {
  currentAssetPair: any,
  onTransactionsClick: Function,
  onTokensClick: Function,
  pendingTransactionsCount: Array<any>,
  address: any,
  isSocketConnected: Boolean,
  networkId: any,
}

const Header = ({
  currentAssetPair,
  onTransactionsClick,
  onTokensClick,
  pendingTransactionsCount,
  address,
  networkId,
  isSocketConnected,
}: Props) => {
  const currentAssetPairSymbols = [
    currentAssetPair?.assetDataA?.assetData?.symbol || 'ZRX',
    currentAssetPair?.assetDataB?.assetData?.symbol || 'WETH',
  ];
  const currentAssetPairName = currentAssetPairSymbols.join('/');
  const currentLink = currentAssetPairSymbols.join('-');
  return (
    <S.Header>
      <S.InstexLogo src={logo} alt="logo" />
      <S.Trade>
        <S.HeaderIcon type="swap" />
        <Link to={currentLink}>
          Trade
        </Link>
      </S.Trade>
      <S.Account>
        <S.HeaderIcon type="home" />
        <Link to="/account">
          Account
        </Link>
      </S.Account>
      <Button
        type="primary"
        onClick={onTokensClick}
      >
          Tokens(
        {currentAssetPairName}
          )
        <S.HeaderIcon type="right" />
      </Button>
      <S.NotificationContainer>
        <S.CurrentNetwork>
          <Tag>
            <Icon type="global" />
            {' '}
            {
                  utils.getNetwork(networkId).name
                }
            {' '}
            {'network'}
          </Tag>
        </S.CurrentNetwork>
        {!isSocketConnected
          && (
            <Tooltip
              placement="bottom"
              title={(
                <div>
                  Socket is disconnected. Orderbook will not be updated!!!
                </div>
              )}
            >
              <S.WarningIcon />
            </Tooltip>
          )
        }
        <S.UserProfile>
          <Tag>
            <S.HeaderIcon type="user" />
            {address?.slice(0, 16)}
            ...
          </Tag>
        </S.UserProfile>
        <S.TransactionsBadge count={pendingTransactionsCount}>
          <S.TransactionsIcon onClick={onTransactionsClick} />
        </S.TransactionsBadge>
      </S.NotificationContainer>
    </S.Header>
  );
};

export default Header;
