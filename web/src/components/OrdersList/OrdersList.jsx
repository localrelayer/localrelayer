// @flow
import React from 'react';
import {
  Table,
} from 'antd';

import type {
  Node,
  StatelessFunctionalComponent,
} from 'react';
import type {
  Order,
} from 'instex-core/types';


type Props = {
  /** Orders info */
  data: Array<Order>,
};

const columns = [
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
];

/**
 * List of all orders
 * @version 1.0.0
 * @author [Tim Reznich](https://github.com/imbaniac)
 */
const OrdersList: StatelessFunctionalComponent<Props> = ({ data }: Props): Node => (
  <Table columns={columns} dataSource={data} />
);

export default OrdersList;
