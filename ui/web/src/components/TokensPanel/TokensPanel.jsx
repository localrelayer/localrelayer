// @flow
import React, {
  useState,
} from 'react';
import {
  Input,
  Tooltip,
} from 'antd';
import {
  ColoredSpan,
} from 'web-components/SharedStyledComponents';
import type {
  Node,
} from 'react';
import * as colors from 'web-styles/colors';
import * as S from './styled';

type Props = {
  isVisible: Boolean,
  onClose: Function,
  listedAssetPairs: Array<any>,
  onPairClick: Function,
}

const getColumns = quoteTokens => [
  {
    title: 'Pair',
    key: 'pair',
    render: (text, record) => (
      <Tooltip
        title={`${record.assetDataA.assetData.name} / ${record.assetDataB.assetData.name}`}
      >
        {[
          record.assetDataA.assetData.symbol,
          record.assetDataB.assetData.symbol,
        ].join('/')}
      </Tooltip>),
    filters: quoteTokens.map(token => ({
      text: token.name,
      value: token.address,
    })),
    onFilter: (value, record) => record.assetDataB.assetData.address.indexOf(value) === 0,
  },
  {
    title: 'Last Price',
    dataIndex: 'tradingInfo.lastPrice',
    render: text => (text === 0 ? '---' : text),
    sorter: (a, b) => a.tradingInfo.lastPrice - b.tradingInfo.lastPrice,
  },
  {
    title: '24h Price',
    dataIndex: 'tradingInfo.change24',
    sorter: (a, b) => a.tradingInfo.change24 - b.tradingInfo.change24,
    render: text => (
      text >= 0
        ? (
          <ColoredSpan color={colors.green}>
            {`+${text || '0.00'}%`}
          </ColoredSpan>
        )
        : (
          <ColoredSpan color={colors.red}>
            {`${text || '0.00'}%`}
          </ColoredSpan>
        )
    ),
  },
  {
    title: 'Volume (WETH)',
    dataIndex: 'tradingInfo.assetBVolume',
    defaultSortOrder: 'descend',
    render: text => (text === 0 ? '---' : text),
    sorter: (a, b) => a.tradingInfo.assetBVolume - b.tradingInfo.assetBVolume,
  },
];

const TokensPanel = ({
  isVisible,
  onClose,
  listedAssetPairs,
  onPairClick,
  quoteTokens,
}: Props): Node => {
  const [searchText, setSearchText] = useState('');
  const s = searchText.toLowerCase();
  return (
    <S.TokensDrawer
      closable
      placement="left"
      onClose={onClose}
      visible={isVisible}
      width="40%"
    >
      <S.DrawerContent>
        <S.SearchBar>
          <Input
            autoFocus
            value={searchText}
            onChange={ev => setSearchText(ev.target.value)}
            placeholder="Search token name or symbol"
          />
        </S.SearchBar>
        <S.TokensTable
          rowKey="id"
          columns={getColumns(quoteTokens)}
          pagination={false}
          onRow={record => ({
            onClick: () => onPairClick(record),
          })}
          dataSource={listedAssetPairs.filter(p => (
            searchText.length
              ? (
                p.assetDataA.assetData.name.toLowerCase().includes(s)
              || p.assetDataB.assetData.name.toLowerCase().includes(s)
              || p.assetDataA.assetData.symbol.toLowerCase().includes(s)
              || p.assetDataB.assetData.symbol.toLowerCase().includes(s)
              )
              : true
          ))}
        />
      </S.DrawerContent>
    </S.TokensDrawer>
  );
};

export default TokensPanel;
