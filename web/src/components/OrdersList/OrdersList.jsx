// @flow
import React from 'react';

import {
  Table,
} from 'antd';

import type {
  Node,
} from 'react';
import type {
  Orders,
} from 'instex-core/types';

import {
  OrdersListContainer,
  TableTitle,
} from './styled';


type Props = {
  /** Orders info */
  data: Orders,
  /** Title above table */
  title?: string,
  /**
   * List of columns
   * */
  columns: Array<Object>,
  /** Does table has borders */
  bordered?: boolean,
  /** Antd pagination config object */
  pagination: {
    pageSize: number,
  } | null,
  /** Called on row click */
  onClick: Function,
};

/**
 * List of all orders
 * @version 1.0.0
 * @author [Tim Reznich](https://github.com/imbaniac)
 */

const OrdersList = ({
  data,
  title,
  columns,
  bordered,
  pagination,
  onClick,
}: Props): Node =>
  <OrdersListContainer>
    <TableTitle>{title}</TableTitle>
    <Table
      size="small"
      rowKey="id"
      bordered={bordered}
      columns={columns}
      dataSource={data}
      pagination={pagination}
      onRow={record => ({
        onClick: () => onClick(record),
      })}
    />
  </OrdersListContainer>;

OrdersList.defaultProps = {
  title: '',
  bordered: false,
  pagination: null,
  onClick: () => {},
};

export default OrdersList;
