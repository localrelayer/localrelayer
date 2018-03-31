import React from 'react';
import {
  Icon,
} from 'antd';
import {
  Table,
  IconContainer,
  AmountFillContainer,
} from './styled';
import {
  Colored,
} from '../SharedStyles';

type Props = {
  // List of orders
  orders: Orders,
  /** Fills order (zrx) */
  fillOrder: Function,
  showHeader: boolean,
  type: 'sell'|'buy',
};

const calculateFill = (amount, orders) => {
  const avg = orders.reduce((sum, order) => sum + +order.amount, 0) / orders.length;

  // const sortedOrders = orders.sort((a, b) => a.amount - b.amount);
  // const lowMiddle = Math.floor((sortedOrders.length - 1) / 2);
  // const highMiddle = Math.ceil((sortedOrders.length - 1) / 2);
  // const median = (+sortedOrders[lowMiddle].amount + +sortedOrders[highMiddle].amount) / 2;

  // const fill = amount / avg >= 1 ? '100%' : `${(amount / avg) * 100}%`;
  // const fill = amount >= median ? '100%' : `${(amount / median) * 100}%`;

  return `${(amount / 1000) * 100}%`;
};

export default ({
  showHeader,
  orders,
  fillOrder,
  type,
}: Props) => (
  <Table className="Table">
    {showHeader &&
      <div className="Table-row Table-header">
        <div className="Table-row-item">Price</div>
        <div className="Table-row-item">Amount</div>
        <div className="Table-row-item">Total</div>
        <IconContainer className="Table-row-item" />
      </div>}
    {
      orders.length > 0 ? orders.map((order, i) => (
        <div
          key={order.id}
          style={{
            position: 'relative',
            marginTop: i === 0 && type === 'sell' ? 'auto' : 0,
          }}
          className="Table-row"
          onClick={() => fillOrder(order)}
        >
          <div className="Table-row-item" data-header="Header1">
            <Colored className={type === 'sell' ? 'red' : 'green'}>{order.price}</Colored>
          </div>
          <div className="Table-row-item" data-header="Header2">{order.amount}</div>
          <div className="Table-row-item" data-header="Header3">{order.total}</div>
          <IconContainer className="Table-row-item" >
            {order.isUser ? <Icon type="user" /> : null}
          </IconContainer>
          <IconContainer className="Table-row-item" >
            {order.status === 'pending' ? <Icon type="loading" /> : null}
          </IconContainer>
          <AmountFillContainer width={calculateFill(order.amount, orders)} type={type} />
        </div>
      ))
      :
      <div style={{ margin: type === 'sell' ? '72% auto' : '8% auto' }}>No {type} orders</div>
    }
  </Table>);
