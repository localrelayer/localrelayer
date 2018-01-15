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
};

/**
 * List of all orders
 * @version 1.0.0
 * @author [Tim Reznich](https://github.com/imbaniac)
 */

const OrdersList = ({
  data, title, columns, onClick, bordered,
}: Props): Node => (
  <OrdersListContainer>
    <TableTitle>{title}</TableTitle>
    <Table
      size="small"
      bordered={bordered}
      columns={columns}
      dataSource={data}
      onRow={(record, index) => ({
        onClick: () => onClick(record, index),
      })}
    />
  </OrdersListContainer>
);

OrdersList.defaultProps = {
  title: '',
  onClick: () => {},
  bordered: true,
};

export default OrdersList;
