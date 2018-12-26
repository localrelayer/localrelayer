// @flow
import React from 'react';
import * as colors from 'web-styles/colors';
import {
  Popover,
} from 'antd';
import * as S from './styled';

type Props = {
  order: any,
  onClick: Function,
  tokenMarketPrice: Number,
  type: String,
};

const OrderItem = ({
  order,
  tokenMarketPrice,
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
        <div>
          Price:
          {' '}
          {order.price}
        </div>
        <div>
          Amount:
          {' '}
          {order.amount}
        </div>
        <div>
          Total:
          {' '}
          {order.total}
        </div>
        <div>
          Total USD:
          {' '}
          {`${(tokenMarketPrice * order.total).toFixed(2)}`}
        </div>
        <div>
          Pair:
          {' '}
          {order.pair}
        </div>
      </div>
)}
    title={(
      <div>
        <S.PopoverHeader actionType={type}>
          {`${type === 'bids' ? 'Sell' : 'Buy'}`}
          {' '}
          Order
        </S.PopoverHeader>
        <S.ClickToAction>
          Click on the row to fill order using form
        </S.ClickToAction>
      </div>
)}
    placement="right"
  >
    <S.OrderItem
      onClick={onClick}
      className="orderItem"
    >
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
