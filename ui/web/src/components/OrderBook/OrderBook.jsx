// @flow
import React from 'react';

import OrderItem from './OrderItem';
import * as S from './styled';


type Props = {
  asks: Array<any>,
  bids: Array<any>,
  onOrderClick: Function,
};

const OrderBook = ({
  asks,
  bids,
  onOrderClick,
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
            onClick={() => onOrderClick(order.id, 'bid')}
          />
        ))}
      </S.AsksItemsList>
    </S.Asks>
    <S.Spread>
      Spread:
      {' '}
      { asks.length && bids.length
        ? (asks[0].price - bids[0].price).toFixed(8)
        : '0.00000000'
      }
    </S.Spread>
    <S.Bids>
      <S.BidsItemsList>
        {bids.map(order => (
          <OrderItem
            key={order.id}
            order={order}
            onClick={() => onOrderClick(order.id, 'ask')}
          />
        ))}
      </S.BidsItemsList>
    </S.Bids>
  </S.OrderBook>
);

export default OrderBook;
