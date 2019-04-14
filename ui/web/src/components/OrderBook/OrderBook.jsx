// @flow
import React from 'react';

import OrderItem from './OrderItem';
import * as S from './styled';


type Props = {
  asks: Array<any>,
  bids: Array<any>,
  tokenMarketPrice: Number,
  onOrderClick: Function,
  onFillClick: Function,
  assetPair: any,
};

const OrderBook = ({
  asks,
  bids,
  tokenMarketPrice,
  onOrderClick,
  assetPair,
  onFillClick,
}: Props) => (
  <S.OrderBook
    id="orderBook"
  >
    <S.Header>
      <S.HeaderTh>
        Price
        {' '}
        <small>
          {assetPair?.assetDataB?.assetData?.symbol}
        </small>
      </S.HeaderTh>
      <S.HeaderTh>
        Amount
        {' '}
        <small>
          {assetPair?.assetDataA?.assetData?.symbol}
        </small>
      </S.HeaderTh>
      <S.HeaderTh>
        Total
        {' '}
        <small>
          {assetPair?.assetDataB?.assetData?.symbol}
        </small>
      </S.HeaderTh>
    </S.Header>
    <S.Asks>
      <S.AsksItemsList>
        {asks.map(order => (
          <OrderItem
            quoteToken={assetPair?.assetDataB?.assetData?.symbol}
            onFillClick={onFillClick}
            key={order.id}
            order={order}
            tokenMarketPrice={tokenMarketPrice}
            onClick={() => onOrderClick(order.id, 'bid')}
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
            quoteToken={assetPair?.assetDataB?.assetData?.symbol}
            onFillClick={onFillClick}
            key={order.id}
            order={order}
            tokenMarketPrice={tokenMarketPrice}
            onClick={() => onOrderClick(order.id, 'ask')}
            type="bids"
          />
        ))}
      </S.BidsItemsList>
    </S.Bids>
  </S.OrderBook>
);

export default OrderBook;
