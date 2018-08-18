// @flow
import React from 'react';
import {
  Input,
  // Radio,
  Select,
} from 'antd';

import type {
  Node,
  StatelessFunctionalComponent,
} from 'react';
import type {
  Tokens,
  Token,
} from 'instex-core/types';

import {
  TokenListContainer,
  InputContainer,
  TableContainer,
} from './styled';
import {
  Colored,
} from '../../SharedStyles';

// const RadioButton = Radio.Button;
// const RadioGroup = Radio.Group;
const { Option } = Select;

type Props = {
  /** List of all orders */
  tokens: Tokens,
  /** Selected token */
  selectedToken: Token,
  /** Selected token pair */
  tokenPair: Token,
  /**
   * Function that is called whenever token select
   * */
  onSelect: Function,
  /**
   * Function that is called when searching token
   * */
  onSearch: Function,
  /** Function that is called whenever pair select */
  onPairSelect: Function,
};

const getColumns = () => [{
  title: 'Coin',
  dataIndex: 'symbol',
  key: 'symbol',
  render: text => <a>{text}</a>,
},
{
  title: 'Price',
  dataIndex: 'tradingInfo.lastPrice',
  key: 'lastPrice',
  render: text => text || '--',
},
{
  title: 'Volume',
  dataIndex: 'tradingInfo.volume',
  key: 'volume',
  render: text => text || '--',
  defaultSortOrder: 'descend',
  sorter: (a, b) => {
    const volumeA = a.tradingInfo.volume || 0;
    const volumeB = b.tradingInfo.volume || 0;
    return volumeA - volumeB;
  },
},
{
  title: 'Volume (ETH)',
  dataIndex: 'tradingInfo.ethVolume',
  key: 'ethVolume',
  render: text => text || '--',
  sorter: (a, b) => {
    const volumeA = a.tradingInfo.ethVolume || 0;
    const volumeB = b.tradingInfo.ethVolume || 0;
    return volumeA - volumeB;
  },
},
{
  title: 'Change',
  dataIndex: 'tradingInfo.change24Hour',
  key: 'change24Hour',
  render: (text) => {
    if (!text) return '--';
    return text > 0 ? (
      <Colored className="green">{`+${text}%`}</Colored>
    ) : (
      <Colored className="red">{`${text}%`}</Colored>
    );
  },
}];

/**
 * Tokens list
 * @version 1.0.0
 * @author [Tim Reznich](https://github.com/imbaniac)
 */

const TokensList: StatelessFunctionalComponent<Props> = ({
  tokens,
  selectedToken,
  onSelect,
  onSearch,
  onPairSelect,
  tokenPair,
}: Props): Node =>
  <TokenListContainer>
    <InputContainer>
      <Input
        autoFocus
        placeholder="Search token name, symbol or address"
        onChange={e => onSearch(e.target.value)}
        addonAfter={
          <Select defaultValue="WETH" style={{ width: 100 }}>
            <Option value="WETH">WETH</Option>
          </Select>
        }
      />
      { /* <RadioGroup
        onChange={(e) => {
          const pair = tokens.find(token => token.symbol === e.target.value) || {};
          onPairSelect(pair);
        }}
        value={tokenPair.symbol}
      >
        <RadioButton value="WETH">WETH</RadioButton>
        <RadioButton value="DAI">DAI</RadioButton>
        <RadioButton value="USDT">USDT</RadioButton>
      </RadioGroup> */ }
    </InputContainer>
    <TableContainer
      size="small"
      rowKey="id"
      bordered={false}
      columns={getColumns()}
      dataSource={tokens}
      onRow={record => ({
        onClick: () => onSelect(record),
      })}
    />
  </TokenListContainer>;

export default TokensList;
