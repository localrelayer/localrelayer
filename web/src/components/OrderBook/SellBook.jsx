// @flow
import React from 'react';
import type {
  Node,
  StatelessFunctionalComponent,
} from 'react';
import type {
  Orders,
} from 'instex-core/types';
import {
  Icon,
  Divider,
} from 'antd';

import {
  OrderBookContainer,
  SpreadContainer,
} from './styled';
import {
  Colored,
} from '../SharedStyles';
import OrdersList from '../OrdersList';


type Props = {
  /** Buy orders */
  buyOrders: Orders,
  /** Sell orders */
  sellOrders: Orders,
  /** Fills order (zrx) */
  fillOrder: Function,
};

const columns = [
  {
    key: 'isUser',
    render: (text, order) => (order.isUser ? <Icon type="user" /> : null),
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
    render: (text: string) =>
      <Colored color="red">
        {text}
      </Colored>,
  },
  {
    render: (text, order) => (order.status === 'pending' ? <Icon type="loading" /> : null),
  },
];

/**
 * Buy Book
 * @version 1.0.0
 * @author [Tim Reznich](https://github.com/imbaniac)
 */

const SellBook: StatelessFunctionalComponent<Props> = ({
  sellOrders,
  fillOrder,
}: Props): Node => (

  <OrdersList
    title="Sell"
    data={sellOrders}
    columns={columns}
    onClick={fillOrder}
  />
);

export default SellBook;
