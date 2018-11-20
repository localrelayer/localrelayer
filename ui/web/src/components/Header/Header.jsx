// @flow
import React, {
  useState,
} from 'react';
import {
  Input,
} from 'antd';
import * as S from './styled';
import logo from '../../assets/logo5.png';

type Props = {
  listedAssetPairs: Array<any>,
  currentAssetPair: any,
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

const Header = ({
  listedAssetPairs,
  currentAssetPair,
}: Props) => {
  const [searchText, setSearchText] = useState('');
  const s = searchText.toLowerCase();
  const currentAssetPairName = (
    currentAssetPair
      ? [
        currentAssetPair.assetDataA.assetData.symbol,
        currentAssetPair.assetDataB.assetData.symbol,
      ].join('/')
      : ''
  );
  return (
    <S.Header>
      <S.InstexLogo src={logo} alt="logo" />
      <S.Trade>
        <S.HeaderIcon type="swap" />
        Trade
      </S.Trade>
      <S.Account>
        <S.HeaderIcon type="home" />
        Account
      </S.Account>
      <S.TokensPopover
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
        <S.TokensButton type="primary">
          Tokens(
          {currentAssetPairName}
          )
          <S.HeaderIcon type="down" />
        </S.TokensButton>
      </S.TokensPopover>
    </S.Header>
  );
};

export default Header;
