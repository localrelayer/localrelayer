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
    <S.Header>
      <S.HeaderTh>
          Size
      </S.HeaderTh>
      <S.HeaderTh>
          Price
      </S.HeaderTh>
      <S.HeaderTh>
          Amount
      </S.HeaderTh>
    </S.Header>
    <S.Asks>
      <S.AsksItemsList>
        {asks.map(order => (
          <OrderItem
            key={order.id}
            order={order}
            onClick={() => onOrderClick(order.id, 'bid')}
            orders={asks}
            allOrders={[...asks, ...bids]}
            type="asks"
          />
        ))}
      </S.AsksItemsList>
    </S.Asks>
    <S.Spread>
      <div>
      Spread:
        {' '}
        { asks.length && bids.length
          ? (asks[0].price - bids[0].price).toFixed(8)
          : '0.00000000'
      }
      </div>
    </S.Spread>
    <S.Bids>
      <S.BidsItemsList>
        {bids.map(order => (
          <OrderItem
            key={order.id}
            order={order}
            onClick={() => onOrderClick(order.id, 'ask')}
            orders={bids}
            allOrders={[...asks, ...bids]}
            type="bids"
          />
        ))}
      </S.BidsItemsList>
    </S.Bids>
  </S.OrderBook>
);

export default OrderBook;
