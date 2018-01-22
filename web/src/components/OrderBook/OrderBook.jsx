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
}: Props): Node => (
  <OrderBookContainer>
    <OrdersList
      data={sellOrders}
      title="Sell orders"
      columns={columns.sell}
    />
    <OrdersList
      data={buyOrders}
      title="Buy orders"
      columns={columns.buy}
    />
  </OrderBookContainer>
);

export default OrderBook;
