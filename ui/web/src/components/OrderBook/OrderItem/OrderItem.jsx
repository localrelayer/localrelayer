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


const OrderItem = ({
  order,
  onClick,
  type,
}: Props) => (
  <Popover
    content={(
      <div>
        <div>
          Expire:
          {' '}
          {order.formattedExpirationTime}
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
      <S.Bar
        width={order.barWidth}
        color={type === 'bids' ? colors.green : colors.red}
      />
      <div>
        {order.price.slice(0, 12)}
      </div>
      <div>
        {order.amount.slice(0, 12)}
      </div>
      <div>
        {order.total.slice(0, 12)}
      </div>
    </S.OrderItem>
  </Popover>
);

export default OrderItem;
