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
} from 'antd';

import {
  OrderBookContainer,
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

const columns = {
  sell: [
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
      render: (text, order) => (order.isUser ? <Icon type="user" /> : null),
    },
    {
      render: (text, order) => (order.status === 'pending' ? <Icon type="loading" /> : null),
    },
  ],
  buy: [
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
        <Colored color="green">{text}</Colored>,
    },
    {
      render: (text, order) => (order.isUser ? <Icon type="user" /> : null),
    },
    {
      render: (text, order) => (order.status === 'pending' ? <Icon type="loading" /> : null),
    },
  ],
};

/**
 * Order Book
 * @version 1.0.0
 * @author [Tim Reznich](https://github.com/imbaniac)
 */

const OrderBook: StatelessFunctionalComponent<Props> = ({
  buyOrders,
  sellOrders,
  fillOrder,
}: Props): Node => (
  <OrderBookContainer>
    <OrdersList
      data={sellOrders}
      title="Sell orders"
      columns={columns.sell}
      onClick={fillOrder}
    />
    <OrdersList
      data={buyOrders}
      title="Buy orders"
      columns={columns.buy}
      onClick={fillOrder}
    />
  </OrderBookContainer>
);

export default OrderBook;
