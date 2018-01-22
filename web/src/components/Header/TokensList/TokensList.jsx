// @flow
import React from 'react';
import {
  Table,
} from 'antd';

import type {
  Node,
  StatelessFunctionalComponent,
} from 'react';
import type {
  Tokens,
} from 'instex-core/types';

import {
  TokenListContainer,
} from './styled';
import {
  Colored,
} from '../../SharedStyles';


type Props = {
  /** List of all orders */
  tokens: Tokens,
  /** Selected token */
  selectedTokenId: ?string,
  /**
   * Function that is called whenever token select
   * */
  onSelect: Function,
};

const getColumns = (onSelect, selectedTokenId) => [
  {
    title: 'Coin',
    dataIndex: 'symbol',
    key: 'symbol',
  },
  {
    title: 'Price',
    dataIndex: 'highPrice',
    key: 'highPrice',
  },
  {
    title: 'Volume',
    dataIndex: 'volume',
    key: 'volume',
    sorter: (a, b) => a.volume - b.volume,
  },
  {
    title: 'Change',
    dataIndex: 'change24Hour',
    key: 'change24Hour',
    render: text =>
      (text > 0 ? (
        <Colored color="green">{`+${text}%`}</Colored>
      ) : (
        <Colored color="red">{`${text}%`}</Colored>
      )),
  },
  {
    title: '',
    dataIndex: '',
    key: 'x',
    render: (text, record) =>
      (!selectedTokenId || selectedTokenId !== record.id) &&
        (
          <a
            href="#"
            onClick={(ev) => {
              ev.preventDefault();
              onSelect(record);
            }}
          >
            Select
          </a>
        ),
  },
];

/**
 * Tokens list
 * @version 1.0.0
 * @author [Tim Reznich](https://github.com/imbaniac)
 */

const TokensList: StatelessFunctionalComponent<Props> = ({
  tokens,
  selectedTokenId,
  onSelect,
}: Props): Node =>
  <TokenListContainer>
    <Table
      size="small"
      rowKey="id"
      bordered={false}
      columns={getColumns(onSelect, selectedTokenId)}
      dataSource={tokens}
    />
  </TokenListContainer>;

export default TokensList;
