// @flow
import React from 'react';
import { Table } from 'antd';
import type { Node, StatelessFunctionalComponent } from 'react';
import type { Order } from 'instex-core/types';

import { OrdersListContainer, TableTitle } from './styled';

type Props = {
  /** Orders info */
  data: Array<Order>,
  title: string,
  columns: Array<Object>,
};

/**
 * List of all orders
 * @version 1.0.0
 * @author [Tim Reznich](https://github.com/imbaniac)
 */

const OrdersList: StatelessFunctionalComponent<Props> = ({ data, title, columns }: Props): Node => (
  <OrdersListContainer>
    <TableTitle>{title}</TableTitle>
    <Table bordered columns={columns} dataSource={data} />
  </OrdersListContainer>
);

export default OrdersList;
