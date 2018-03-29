// @flow
import React from 'react';
import type { Node } from 'react';
import {
  Tooltip,
  Button,
  Icon,
} from 'antd';
import type { Order } from 'instex-core/types';
import { Element } from 'react-scroll';
import moment from 'moment';

import { UserOrdersContainer } from './styled';
import { Colored } from '../SharedStyles';
import OrdersList from '../OrdersList';

type Props = {
  /** List of all orders */
  orders: Array<Order>,
  /**
   * Function that is called whenever order canceled
   * */
  onCancel: (id: string) => void,
  /** Table title */
  title: string,
  /** Antd pagination config object */
  pagination: {
    pageSize: number,
  } | null,
};

export const getColumns = (onCancel: (id: string) => void) => [
  // {
  //   title: 'Type',
  //   dataIndex: 'type',
  //   key: 'type',
  //   render: (text: string, record: Order) => (
  //     <Colored color={record.type === 'sell' ? 'red' : 'green'}>{text}</Colored>
  //   ),
  // },
  {
    title: 'Pair',
    key: 'user/pair',
    render: (text: string, order: Order) => `${order.tokenSymbol}/${order.pairSymbol}`,
  },
  {
    title: 'Expires',
    dataIndex: 'expires',
    key: 'user/expires',
    render: (text: string) => (
      <Tooltip title={moment(text).format('ddd, MMM DD, YYYY hh:mm:ss A')}>
        {moment(text).format('DD/MM HH:mm')}
      </Tooltip>
    ),
  },
  {
    title: 'Price',
    dataIndex: 'price',
    key: 'user/price',
    render: (text: string) => Number(text).toFixed(4),
  },
  {
    title: 'Amount',
    dataIndex: 'amount',
    key: 'user/amount',
    render: (text: string, record: Order) => <Colored color={record.type === 'buy' ? 'green' : 'red'}>{Number(text).toFixed(4)}</Colored>,
  },
  // {
  //   title: 'Total',
  //   dataIndex: 'total',
  //   key: 'total',
  //   render: (text: string, record: Order) =>
  //     <Colored color={record.type === 'buy' ? 'green' : 'red'}>{Number(text).toFixed(2)}</Colored>,
  // },
  {
    title: 'Action',
    key: 'user/action',
    render: (text: string, record: Order) => (
      <a

        className="cancel"
        onClick={(e) => {
          e.stopPropagation();
          onCancel(record.id);
        }}
        size="small"
        type="primary"

      >Cancel
      </a>
    ),
  },
];

/**
 * Trading History
 * @version 1.0.0
 * @author [Tim Reznich](https://github.com/imbaniac)
 */

const UserOrders = ({
  orders,
  onCancel,
  title,
  pagination,
}: Props): Node => (
  <Element name="userOrders">
    <UserOrdersContainer>
      <OrdersList
        title={title}
        pagination={pagination}
        columns={getColumns(onCancel)}
        data={orders}
      />
    </UserOrdersContainer>
  </Element>
);

UserOrders.defaultProps = {
  onCancel: () => {},
};

export default UserOrders;
