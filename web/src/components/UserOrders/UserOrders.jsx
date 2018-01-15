// @flow
import React from 'react';
import type { Node, StatelessFunctionalComponent } from 'react';
import { Tooltip, Button } from 'antd';
import type { Order } from 'instex-core/types';
import moment from 'moment';

import { UserOrdersContainer } from './styled';
import { Colored } from '../SharedStyles';
import OrdersList from '../OrdersList';

type Props = {
  /** List of all orders */
  orders: Array<Order>,
  /**
   * Function that is called whenever order clicked
   * */
  onClick: Function,
  /**
   * Function that is called whenever order canceled
   * */
  onCancel: Function,
};

export const getColumns = (onCancel: Function) => [
  {
    title: 'Type',
    dataIndex: 'action',
    key: 'action',
    render: (text: string, record: Order) => (
      <Colored color={record.action === 'sell' ? 'red' : 'green'}>{text}</Colored>
    ),
  },
  {
    title: 'Token',
    dataIndex: 'token',
    key: 'token',
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
      <Tooltip title={moment(text).format('llll')}>{moment(text).format('L')}</Tooltip>
    ),
  },
  {
    title: 'Action',
    render: (text: string, record: Order) => (
      <Button
        className="cancel"
        onClick={(e) => {
          e.stopPropagation();
          onCancel(record);
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

const UserOrders: StatelessFunctionalComponent<Props> = ({
  orders,
  onClick,
  onCancel,
}: Props): Node => (
  <UserOrdersContainer>
    <OrdersList title="My orders" columns={getColumns(onCancel)} data={orders} onClick={onClick} />
  </UserOrdersContainer>
);

export default UserOrders;
