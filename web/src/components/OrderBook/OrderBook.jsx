// @flow
import React from 'react';
import type { Node, StatelessFunctionalComponent } from 'react';
import type { Order } from 'instex-core/types';

import { OrderBookContainer } from './styled';
import { Colored } from '../SharedStyles';
import OrdersList from '../OrdersList';

type Props = {
  /** Buy orders */
  buyOrders: Array<Order>,
  /** Sell orders */
  sellOrders: Array<Order>,
  /**
   * Function that is called whenever order clicked
   * */
  onClick: Function,
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

const OrderBook: StatelessFunctionalComponent<Props> = ({
  buyOrders,
  sellOrders,
  onClick,
}: Props): Node => (
  <OrderBookContainer>
    <OrdersList title="Sell orders" columns={columns.sell} data={sellOrders} onClick={onClick} />
    <OrdersList title="Buy orders" columns={columns.buy} data={buyOrders} onClick={onClick} />
  </OrderBookContainer>
);

export default OrderBook;
