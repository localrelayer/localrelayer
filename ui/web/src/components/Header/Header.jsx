// @flow
import React from 'react';
import {
  Input,
  Select,
} from 'antd';
import * as S from './styled';
import logo from '../../assets/logo5.png';

type Props = {
  tokensInfo: Array<any>,
}
const columns = [
  {
    title: 'Coin',
    dataIndex: 'coin',
    key: 'coin',
    render: text => text || '--',
  },
  {
    title: 'Price',
    dataIndex: 'price',
    key: 'price',
    render: text => text || '--',
  },
  {
    title: 'Volume',
    dataIndex: 'volume',
    key: 'volume',
    sorter: (a, b) => a - b,
    render: text => text || '--',
  },
  {
    title: 'Volume (ETH)',
    dataIndex: 'volumeEth',
    key: 'volumeEth',
    sorter: (a, b) => a - b,
    render: text => text || '--',
  },
  {
    title: 'Change',
    dataIndex: 'change',
    key: 'change',
    render: text => text || '--',
  },
];

const Header = ({ tokensInfo }: Props) => (
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
            <Input placeholder="Search token name, symbol or address" />
            <Select defaultValue="WETH">
              <Select.Option value="WETH">
              WETH
              </Select.Option>
            </Select>
          </S.SearchBar>
          <S.TokensTable
            size="middle"
            columns={columns}
            dataSource={tokensInfo}
          />
        </S.PopoverContent>
)}
    >
      <S.TokensButton
        type="primary"
      >
        Tokens(ZRX/WETH)
        <S.HeaderIcon type="down" />
      </S.TokensButton>
    </S.TokensPopover>
  </S.Header>
);

export default Header;
