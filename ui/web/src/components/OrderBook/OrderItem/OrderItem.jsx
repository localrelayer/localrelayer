// @flow
import React from 'react';
import {
  Tooltip,
} from 'antd';

import * as S from './styled';

type Props = {
  order: any,
  onClick: Function,
};

const OrderItem = ({
  order,
  onClick,
}: Props) => (
  <S.OrderItem
    onClick={onClick}
    className="orderItem"
  >
    <div>
      {order.price}
    </div>
    <div>
      {order.amount}
    </div>
    <div>
      {order.total}
    </div>
  </S.OrderItem>
);

export default OrderItem;
