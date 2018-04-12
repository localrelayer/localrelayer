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
  Badge,
} from 'antd';

import {
  OrderBookContainer,
  SpreadContainer,
  IconContainer,
} from './styled';
import TableContainer from './Table';

type Props = {
  /** Buy orders */
  buyOrders: Orders,
  /** Sell orders */
  sellOrders: Orders,
  /** Fills order (zrx) */
  fillOrder: Function,
};

const getSpread = (sellOrder, buyOrder) => {
  if (sellOrder && buyOrder) {
    return (+sellOrder.price - +buyOrder.price).toFixed(6);
  }
  return '0.000000';
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
  <OrderBookContainer id="Order-book">
    <div className="Table-row Table-header">
      <div className="Table-row-item">Price</div>
      <div className="Table-row-item">Amount</div>
      <div className="Table-row-item">Total</div>
      <IconContainer className="Table-row-item" />
    </div>
    <TableContainer type="sell" orders={sellOrders} fillOrder={fillOrder} />
    <SpreadContainer><span style={{ marginRight: 5 }}>{getSpread(sellOrders[0], buyOrders[0])}</span>{' '}<Badge status="processing" text="Realtime" /></SpreadContainer>
    <TableContainer type="buy" orders={buyOrders} fillOrder={fillOrder} />
  </OrderBookContainer>
);

export default OrderBook;
