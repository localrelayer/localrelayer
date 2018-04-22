// @flow
import React from 'react';

import type {
  Node,
  StatelessFunctionalComponent,
} from 'react';
import type {
  Order,
} from 'instex-core/types';
import {
  Tooltip,
} from 'antd';
import moment from 'moment';

import {
  TradingHistoryContainer,
} from './styled';
import {
  Colored,
} from '../SharedStyles';
import OrdersList from '../OrdersList';


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
      <Colored
        className={record.type === 'sell' ? 'red' : 'green'}
      >
        {text}
      </Colored>
    ),
  },
  {
    title: 'Amount',
    dataIndex: 'amount',
    key: 'amount',
  },
  // {
  //   title: 'Total',
  //   dataIndex: 'total',
  //   key: 'total',
  //   render: (text: string, record) => (
  //     <Colored
  //       className={record.type === 'sell' ? 'red' : 'green'}
  //     >
  //       {text}
  //     </Colored>
  //   ),
  // },
];

/**
 * Trading History
 * @version 1.0.0
 * @author [Tim Reznich](https://github.com/imbaniac)
 */

const TradingHistory: StatelessFunctionalComponent<Props> =
  ({
    orders,
    pagination,
  }: Props): Node =>
    <TradingHistoryContainer className="component-container">
      <OrdersList
        title="Trading History"
        columns={columns}
        data={orders}
        onClick={(order) => {
          if (order.tx_hash) {
            window.open(`https://etherscan.io/tx/${order.tx_hash}`);
          }
        }}
        pagination={pagination}
      />
    </TradingHistoryContainer>;

export default TradingHistory;
