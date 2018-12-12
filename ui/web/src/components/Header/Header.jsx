// @flow
import React, {
  useState,
} from 'react';
import {
  Link,
} from 'react-router-dom';
import {
  Input,
  Button,
  Popover,
  Tooltip,
  Tag,
  Icon,
} from 'antd';

import * as S from './styled';
import logo from '../../assets/logo5.png';

type Props = {
  listedAssetPairs: Array<any>,
  currentAssetPair: any,
  onPairClick: Function,
  onTransactionsClick: Function,
  pendingTransactionsCount: Array<any>,
  address: any,
  isSocketConnected: Boolean,
  networkId: any,
}
const columns = [
  {
    title: 'Pair',
    key: 'pair',
    render: (text, record) => ([
      record.assetDataA.assetData.symbol,
      record.assetDataB.assetData.symbol,
    ].join('/')),
  },
  {
    title: 'Base token',
    dataIndex: 'assetDataA.assetData.name',
  },
  {
    title: 'Quote token',
    dataIndex: 'assetDataB.assetData.name',
  },
];

const networkEnum = {
  1: {
    name: 'Mainnet',
    isSupported: true,
  },
  3: {
    name: 'Ropsten',
    isSupported: false,
  },
  4: {
    name: 'Rinkeby',
    isSupported: false,
  },
  42: {
    name: 'Kovan',
    isSupported: true,
  },
  50: {
    name: 'Ganache',
    isSupported: true,
  },
};

const Header = ({
  listedAssetPairs,
  currentAssetPair,
  onPairClick,
  onTransactionsClick,
  pendingTransactionsCount,
  address,
  networkId,
  isSocketConnected,
}: Props) => {
  const [searchText, setSearchText] = useState('');
  const s = searchText.toLowerCase();
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
      <Popover
        trigger="click"
        placement="bottom"
        content={(
          <S.PopoverContent>
            <S.SearchBar>
              <Input
                autoFocus
                value={searchText}
                onChange={ev => setSearchText(ev.target.value)}
                placeholder="Search token name, symbol or address"
              />
            </S.SearchBar>
            <S.TokensTable
              rowKey="id"
              size="middle"
              columns={columns}
              pagination={{ hideOnSinglePage: true }}
              onRow={record => ({
                onClick: () => onPairClick(record),
              })}
              dataSource={listedAssetPairs.filter(p => (
                searchText.length
                  ? (
                    p.assetDataA.assetData.name.toLowerCase().includes(s)
                    || p.assetDataA.assetData.symbol.toLowerCase().includes(s)
                    || p.assetDataA.assetData.address.toLowerCase().includes(s)
                    || p.assetDataB.assetData.symbol.toLowerCase().includes(s)
                    || p.assetDataB.assetData.address.toLowerCase().includes(s)
                  )
                  : true
              ))}
            />
          </S.PopoverContent>
        )}
      >
        <Button type="primary">
          Tokens(
          {currentAssetPairName}
          )
          <S.HeaderIcon type="down" />
        </Button>
      </Popover>
      <S.NotificationContainer>
        <S.CurrentNetwork
          isSupported={networkEnum[networkId].isSupported}
        >
          {networkEnum[networkId].isSupported
            ? (
              <Tag>
                <Icon type="global" />
                {' '}
                {
                  networkEnum[networkId].name
                }
                {' '}
                {'network'}
              </Tag>
            )
            : (
              <Tooltip title="Sorry, but this network is not supported!">
                <Tag>
                  <Icon type="global" />
                  {' '}
                  {
                    networkEnum[networkId].name
                  }
                  {' '}
                  {'network'}
                </Tag>
              </Tooltip>
            )}
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
          <Button loading={!address} type="primary">
            <S.HeaderIcon type="user" />
            {address?.slice(0, 16)}
            ...
          </Button>
        </S.UserProfile>
        <S.TransactionsBadge count={pendingTransactionsCount}>
          <S.TransactionsIcon onClick={onTransactionsClick} />
        </S.TransactionsBadge>
      </S.NotificationContainer>
    </S.Header>
  );
};

export default Header;
