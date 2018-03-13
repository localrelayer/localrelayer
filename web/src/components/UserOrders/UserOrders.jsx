// @flow
import React from 'react';
import type { Node } from 'react';
import { Tooltip, Button } from 'antd';
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
};

export const getColumns = (onCancel: (id: string) => void) => [
  {
    title: 'Type',
    dataIndex: 'type',
    key: 'type',
    render: (text: string, record: Order) => (
      <Colored color={record.type === 'sell' ? 'red' : 'green'}>{text}</Colored>
    ),
  },
  {
    title: 'Pair',
    render: (text: string, order: Order) => `${order.tokenSymbol}/${order.pairSymbol}`,
  },
  {
    title: 'Price',
    dataIndex: 'price',
    key: 'price',
  },
  {
    title: 'Amount',
    dataIndex: 'amount',
    key: 'amount',
  },
  {
    title: 'Total',
    dataIndex: 'total',
    key: 'total',
  },
  {
    title: 'Expires',
    dataIndex: 'expires',
    key: 'expires',
    render: (text: string) => (
      <Tooltip title={moment(text).format('llll')}>{moment(text).format('DD/MM/YYYY HH:mm')}</Tooltip>
    ),
  },
  {
    title: 'Action',
    render: (text: string, record: Order) => (
      <Button
        className="cancel"
        onClick={(e) => {
          e.stopPropagation();
          onCancel(record.id);
        }}
        size="small"
        type="primary"
      >
        Cancel
      </Button>
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
}: Props): Node => (
  <Element name="userOrders">
    <UserOrdersContainer>
      <OrdersList
        title="My orders"
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
