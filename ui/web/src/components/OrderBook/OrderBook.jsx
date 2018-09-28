// @flow
import React from 'react';

import OrderItem from './OrderItem';
import * as S from './styled';


type Props = {
  asks: Array<any>,
  bids: Array<any>,
};

const OrderBook = ({
  asks,
  bids,
}: Props) => (
  <S.OrderBook>
    <S.Asks>
      <S.Header>
        <S.HeaderTh>
          Price
        </S.HeaderTh>
        <S.HeaderTh>
          Amount
        </S.HeaderTh>
        <S.HeaderTh>
          Total
        </S.HeaderTh>
      </S.Header>
      <S.AsksItemsList>
        {asks.map(order => (
          <OrderItem
            key={order.id}
            order={order}
          />
        ))}
      </S.AsksItemsList>
    </S.Asks>
    <S.Spread>
      Spread: 0.234234234
    </S.Spread>
    <S.Bids>
      <S.BidsItemsList>
        {bids.map(order => (
          <OrderItem
            key={order.id}
            order={order}
          />
        ))}
      </S.BidsItemsList>
    </S.Bids>
  </S.OrderBook>
);

export default OrderBook;
