// @flow
import React from 'react';
import {
  Link,
} from 'react-router-dom';
import {
  Tooltip,
  Tag,
  Icon,
} from 'antd';
import {
  utils,
} from 'localrelayer-core';
import logo from 'web-assets/rebranding.png';
import * as S from './styled';

type Props = {
  currentAssetPair: any,
  onTransactionsClick: Function,
  onTokensClick: Function,
  onSetupGuideClick: Function,
  pendingTransactionsCount: Array<any>,
  address: any,
  isSocketConnected: Boolean,
  networkId: any,
  isNetworkSupported: Boolean,
}

const Header = ({
  currentAssetPair,
  onTransactionsClick,
  onTokensClick,
  pendingTransactionsCount,
  address,
  networkId,
  isSocketConnected,
  onSetupGuideClick,
  isNetworkSupported,
}: Props) => {
  const currentAssetPairSymbols = [
    currentAssetPair?.assetDataA?.assetData?.symbol || 'ZRX',
    currentAssetPair?.assetDataB?.assetData?.symbol || 'WETH',
  ];
  const currentAssetPairName = currentAssetPairSymbols.join('/');
  const currentLink = currentAssetPairSymbols.join('-');
  return (
    <div>
      <S.Header>
        <S.LocalRelayerLogo to={currentLink}>
          <img src={logo} alt="logo" />
        </S.LocalRelayerLogo>
        <S.TokensButton
          id="tradingPairs"
          onClick={onTokensClick}
        >
        Tokens(
          {currentAssetPairName}
        )
          <S.HeaderIcon type="right" />
        </S.TokensButton>
        <S.Trade>
          <Link to={currentLink}>
            <S.HeaderIcon type="swap" />
            Trade
          </Link>
        </S.Trade>
        <S.Account>
          <Link to="/account">
            <S.HeaderIcon type="home" />
            Account
          </Link>
        </S.Account>
        <S.Account>
          <a onClick={onSetupGuideClick}>
            <S.HeaderIcon type="setting" />
            Setup Guide
          </a>
        </S.Account>
        <S.NotificationContainer>
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
          <S.UserProfile id="userProfileAddress">
            <Tag>
              <S.HeaderIcon type="user" />
              {address
                ? `${address.slice(0, 16)}...`
                : 'Not Connected'
            }
            </Tag>
          </S.UserProfile>
          <S.TransactionsBadge count={pendingTransactionsCount}>
            <S.TransactionsIcon onClick={onTransactionsClick} />
          </S.TransactionsBadge>
        </S.NotificationContainer>
      </S.Header>
      {
        !isNetworkSupported
        && (
          <S.UnsupportedNetwork>
            <Icon
              type="exclamation-circle"
              theme="filled"
            />
            {' '}
            This network is not supported.
            Please choose one among supported networks:
            {' '}
            {Object.keys(utils.networks)
              .filter(key => utils.networks[key].isSupported)
              .map(key => utils.networks[key].name)
              .join(', ')}
            .
          </S.UnsupportedNetwork>
        )
      }
    </div>
  );
};

export default Header;
