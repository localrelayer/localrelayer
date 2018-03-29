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
  Badge,
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

const columns = {
  sell: [
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
  ],
  buy: [
    {
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
        <Colored color="green">{text}</Colored>,
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
      data={sellOrders.slice(0, 12)}
      columns={columns.sell}
      onClick={fillOrder}
      pagination={false}
    />
    <SpreadContainer><Badge status="processing" text={0.026927} /></SpreadContainer>
    <OrdersList
      data={buyOrders.slice(0, 12)}
      columns={columns.buy}
      onClick={fillOrder}
      showHeader={false}
      pagination={false}
    />
  </OrderBookContainer>
);

export default OrderBook;
