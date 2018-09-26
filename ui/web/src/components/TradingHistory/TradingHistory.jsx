// @flow
import React from 'react';
import {
  Table,
  Tooltip,
  Icon,
} from 'antd';
import moment from 'moment';

import type {
  Node,
} from 'react';
import type {
  Order,
} from 'instex-core/types';

import {
  ComponentTitle,
  ColoredSpan,
} from 'web-components/SharedStyledComponents';


type Props = {
  /** List of all orders */
  orders: Array<Order>,
  /** Pagination config */
  pagination: {
    pageSize: number,
  }
};

const columns = [
  {
    title: 'Date',
    dataIndex: 'completed_at',
    render: (text: string) => (
      <Tooltip title={moment(text).format('ddd, MMM DD, YYYY hh:mm:ss A')}>
        {moment(text).format('DD/MM HH:mm')}
      </Tooltip>
    ),
  },
  {
    title: 'Price',
    dataIndex: 'price',
    key: 'price',
    render: (text: string, record) => (
      <Tooltip title={text}>
        <ColoredSpan
          className={record.type === 'sell' ? 'red' : 'green'}
        >
          {Number(text).toFixed(8)}
        </ColoredSpan>
      </Tooltip>
    ),
  },
  {
    title: 'Amount',
    dataIndex: 'amount',
    key: 'amount',
    render: (text: string) => (
      <Tooltip title={text}>
        {Number(text).toFixed(6)}
      </Tooltip>
    ),
  },
  {
    render: () => <Icon type="select" />,
  },
];

const TradingHistory = ({
  orders,
  pagination,
}: Props): Node => (
  <div>
    <ComponentTitle>
      Trading history
    </ComponentTitle>
    <Table
      size="small"
      rowKey="id"
      columns={columns}
      dataSource={orders}
      pagination={pagination}
      onRow={record => ({
        onClick: () => {
          if (record.tx_hash) {
            window.open(`https://etherscan.io/tx/${record.tx_hash}`);
          }
        },
      })}
    />
  </div>
);

export default TradingHistory;
