import React from 'react';
import {
  Icon,
  Tooltip,
} from 'antd';
import {
  lifecycle,
} from 'recompose';
import {
  Table,
  IconContainer,
  AmountFillContainer,
} from './styled';
import {
  Colored,
} from '../SharedStyles';
import loader from '../../assets/eth.gif';

type Props = {
  // List of orders
  orders: Orders,
  /** Fills order (zrx) */
  fillOrder: Function,
  showHeader: boolean,
  type: 'sell'|'buy',
};

const calculateFill = (total, orders) => {
  // const avg = orders.reduce((sum, order) => sum + +order.amount, 0) / orders.length;
  // const sortedOrders = orders.sort((a, b) => a.amount - b.amount);
  // const lowMiddle = Math.floor((sortedOrders.length - 1) / 2);
  // const highMiddle = Math.ceil((sortedOrders.length - 1) / 2);
  // const median = (+sortedOrders[lowMiddle].amount + +sortedOrders[highMiddle].amount) / 2;

  // const fill = amount / avg >= 1 ? '100%' : `${(amount / avg) * 100}%`;
  // const fill = amount >= median ? '100%' : `${(amount / median) * 100}%`;

  const maxTotal = Math.max(...orders.map(o => o.total));

  // return `${(amount / 1000 > 1 ? 1 : amount / 1000) * 100}%`;
  return `${(total / maxTotal) * 100}%`;
};

const enchance = lifecycle({
  componentWillReceiveProps(nextProps) {
    if (nextProps.orders.length && this.props.orders.length !== nextProps.orders.length) {
      // Scroll to bottom of sell-book
      const element = document.getElementById('sell-book');
      setTimeout(() => {
        element.scrollTop = element.scrollHeight;
      }, 0);
    }
  },
});

export default enchance(({
  orders,
  fillOrder,
  type,
}: Props) => (
  <Table id={`${type}-book`} className="Table">
    {
      orders.length > 0 ? orders.map(order => (
        <Tooltip key={order.id} placement="bottom" title={`Click on order to ${order.type === 'buy' ? 'sell' : 'buy'}`}>
          <div
            style={{ position: 'relative' }}
            className="Table-row"
            onClick={() => fillOrder(order)}
          >
            <div className="Table-row-item" data-header="Header1">{order.price}</div>
            <div className="Table-row-item" data-header="Header2">{order.amount}</div>
            <div className="Table-row-item" data-header="Header3">
              <Colored className={type === 'sell' ? 'red' : 'green'}>{order.total}</Colored>
            </div>
            <IconContainer className="Table-row-item" >
              {order.isUser ? <Icon type="user" /> : null}
            </IconContainer>
            <IconContainer className="Table-row-item" >
              {order.status === 'pending' ? <img alt="pending" src={loader} /> : null}
            </IconContainer>
            {/* <AmountFillContainer width={calculateFill(order.total, orders)} type={type} /> */}
          </div>
        </Tooltip>
      ))
      :
      <div style={{ margin: 'auto' }}>No {type} orders</div>
    }
  </Table>));
