// @flow
import React from 'react';
import {
  Tooltip,
} from 'antd';

import * as S from './styled';


type Props = {
  order: any,
};

const OrderItem = ({ order }: Props) => (
  <Tooltip
    key={order.id}
    title="some hint"
    placement="bottom"
  >
    <S.OrderItem>
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
  </Tooltip>
);

export default OrderItem;
