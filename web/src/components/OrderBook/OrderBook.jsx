// @flow
import React from 'react';
import type { Node, StatelessFunctionalComponent } from 'react';
import type { Order } from 'instex-core/types';

import { OrderBookContainer, Colored } from './styled';
import OrdersList from '../OrdersList';

type Props = {
  /** Buy orders */
  buyOrders: Array<Order>,
  /** Sell orders */
  sellOrders: Array<Order>,
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
      render: (text: string) => <Colored color="red">{text}</Colored>,
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
      render: (text: string) => <Colored color="green">{text}</Colored>,
    },
  ],
};

/**
 * Order Book
 * @version 1.0.0
 * @author [Tim Reznich](https://github.com/imbaniac)
 */

const OrderBook: StatelessFunctionalComponent<Props> = ({ buyOrders, sellOrders }: Props): Node => (
  <OrderBookContainer>
    <OrdersList title="Sell orders" columns={columns.sell} data={sellOrders} />
    <OrdersList title="Buy orders" columns={columns.buy} data={buyOrders} />
  </OrderBookContainer>
);

export default OrderBook;
