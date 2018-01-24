// @flow
import React from 'react';
import {
  Table,
  Input,
  Radio,
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
} from './styled';
import {
  Colored,
} from '../../SharedStyles';

const RadioButton = Radio.Button;
const RadioGroup = Radio.Group;

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

const getColumns = (onSelect, selectedToken, selectedPair) => [{
  title: 'Coin',
  dataIndex: 'symbol',
  key: 'symbol',
},
{
  title: 'Price',
  dataIndex: `trading[${selectedPair.symbol}].lastPrice`,
  key: 'lastPrice',
  render: text => text || '--',
},
{
  title: 'Volume',
  dataIndex: `trading[${selectedPair.symbol}].volume`,
  key: 'volume',
  render: text => text || '--',
  sorter: (a, b) => {
    const volumeA = a.trading[selectedPair.symbol] ? a.trading[selectedPair.symbol].volume : 0;
    const volumeB = b.trading[selectedPair.symbol] ? b.trading[selectedPair.symbol].volume : 0;
    return volumeA - volumeB;
  },
},
{
  title: 'Change',
  dataIndex: `trading[${selectedPair.symbol}].change24Hour`,
  key: 'change24Hour',
  render: (text) => {
    if (!text) return '--';
    return text > 0 ? (
      <Colored color="green">{`+${text}%`}</Colored>
    ) : (
      <Colored color="red">{`${text}%`}</Colored>
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
        placeholder="Search token"
        onChange={e => onSearch(e.target.value)}
      />
      <RadioGroup
        onChange={(e) => {
          const pair = tokens.find(token => token.symbol === e.target.value) || {};
          onPairSelect(pair);
        }}
        value={tokenPair.symbol}
      >
        <RadioButton value="WETH">WETH</RadioButton>
        <RadioButton value="DAI">DAI</RadioButton>
        { /* <RadioButton value="USDT">USDT</RadioButton> */ }
      </RadioGroup>
    </InputContainer>
    <Table
      size="small"
      rowKey="id"
      bordered={false}
      columns={getColumns(onSelect, selectedToken, tokenPair)}
      dataSource={tokens}
      onRow={record => ({
        onClick: () => onSelect(record),
      })}
    />
  </TokenListContainer>;

export default TokensList;
