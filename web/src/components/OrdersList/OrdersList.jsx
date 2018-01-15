// @flow
import React from 'react';
import { Table } from 'antd';
import type { Node } from 'react';
import type { Order } from 'instex-core/types';

import { OrdersListContainer, TableTitle } from './styled';

type Props = {
  /** Orders info */
  data: Array<Order>,
  /** Title above table */
  title?: string,
  /**
   * List of columns
   * */
  columns: Array<Object>,
  /**
   * Function that is called whenever row clicked
   * */
  onClick: (Object, number) => null,
  /** Does table has borders */
  bordered?: boolean,
  /** Antd pagination config object */
  pagination?: Object,
};

/**
 * List of all orders
 * @version 1.0.0
 * @author [Tim Reznich](https://github.com/imbaniac)
 */

const OrdersList = ({
  data, title, columns, onClick, bordered, pagination,
}: Props): Node => (
  <OrdersListContainer>
    <TableTitle>{title}</TableTitle>
    <Table
      size="small"
      bordered={bordered}
      columns={columns}
      dataSource={data}
      pagination={pagination}
      onRow={(record, index) => ({
        onClick: () => onClick(record, index),
      })}
    />
  </OrdersListContainer>
);

OrdersList.defaultProps = {
  title: '',
  onClick: () => {},
  bordered: false,
  pagination: {},
};

export default OrdersList;
