// @flow
import React from 'react';
import { Table, Tooltip } from 'antd';
import moment from 'moment';
import type { Node, StatelessFunctionalComponent } from 'react';

import {
  PendingTransactionsContainer,
} from './styled';
import { Truncate } from '../../SharedStyles';
import loader from '../../../assets/eth.gif';

type Props = {
  /** List of pending transactions */
  items: Array<*>,
};

/**
 * Pending transactions list
 * @version 1.0.0
 * @author [Tim Reznich](https://github.com/imbaniac)
 */

const columns = [
  {
    title: 'Event',
    dataIndex: 'name',
    key: 'label',
  },
  {
    title: 'Token',
    dataIndex: 'token',
    key: 'token',
  },
  {
    title: 'Date',
    dataIndex: 'timestamp',
    key: 'timestamp',
    render: (text: string) => (
      <Tooltip title={moment(text).format('ddd, MMM DD, YYYY hh:mm:ss A')}>
        {moment(text).format('DD/MM HH:mm')}
      </Tooltip>
    ),
  },
  {
    title: 'Etherscan',
    dataIndex: 'txHash',
    key: 'txHash',
    render: (text: string) => (
      <a rel="noopener noreferrer" target="_blank" href={`https://etherscan.io/tx/${text}`}>
        <Truncate>{text}</Truncate>
      </a>
    ),
  },
  {
    render: () => <img alt="pending" src={loader} />,
  },
];

const PendingTransactions: StatelessFunctionalComponent<Props> = ({ items }: Props): Node => (
  <PendingTransactionsContainer>
    <Table
      title={() => items.length ?
        <div>Pending Transactions</div>
        :
        <div>No pending transactions</div>
      }
      size="small"
      showHeader={false}
      pagination={false}
      dataSource={items}
      columns={columns}
    />
  </PendingTransactionsContainer>
);

export default PendingTransactions;
