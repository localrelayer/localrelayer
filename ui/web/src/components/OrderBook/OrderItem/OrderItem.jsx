// @flow
import React from 'react';
import * as colors from 'web-styles/colors';
import {
  Popover,
} from 'antd';
import {
  utils,
} from 'instex-core';
import * as S from './styled';

type Props = {
  order: any,
  onClick: Function,
  orders: Arrays,
  allOrders: Array,
  type: String,
};

// currentOrderAmount / biggestContraryOrder  * 100 / 6

// const calculateAmountBar = (order, orders) => {
//   const biggestOrderAmount = orders.reduce((acc, cur) => Math.max(cur.amount, acc), 0);
//   return `${order.amount / biggestOrderAmount * 100 / 6}%`;
// };

// Bar = accOrderAmount / totalAmount * 100 / 12 * 8

const calculateBar = (order, orders) => {
  const index = orders.findIndex(o => o.id === order.id);
  const previousOrders = orders.slice(0, index);
  const accumulator = previousOrders.reduce((acc, cur) => acc + +cur.amount, +order.amount);
  const totalAmount = orders.reduce((acc, cur) => acc + +cur.amount, 0);
  return `${accumulator / totalAmount * 100 / 12 * 8}%`;
};

const OrderItem = ({
  order,
  onClick,
  orders,
  // allOrders,
  type,
}: Props) => (
  <Popover
    content={(
      <div>
        <div>
          Expire:
          {' '}
          {utils.formatDate('MM/DD/YYYY HH:mm:ss', order.expirationTimeSeconds * 1000)}
        </div>
      </div>
)}
    title="Order Info"
    placement="right"
  >
    <S.OrderItem
      onClick={onClick}
      className="orderItem"
    >
      {/*
    <S.AmountBar
      width={calculateAmountBar(order, allOrders)}
      color={type === 'bids' ? colors.green : colors.red}
    />
    */}
      <div>
        {order.price}
      </div>
      <div>
        {order.amount}
      </div>
      <div>
        {order.total}
      </div>
      <S.Bar
        width={calculateBar(order, orders)}
        color={type === 'bids' ? colors.green : colors.red}
      />
    </S.OrderItem>
  </Popover>
);

export default OrderItem;
