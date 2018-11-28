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
  <Tooltip
    key={order.id}
    title="Click to take order"
    placement="bottom"
  >
    <S.OrderItem
      onClick={onClick}
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
  </Tooltip>
);

export default OrderItem;
