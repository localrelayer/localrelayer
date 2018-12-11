// @flow
import React from 'react';
import * as S from './styled';

type Props = {
  children: React.Node,
}

const columns = [
  {
    rows: [
      {
        components: ['buySell'],
        container: S.BuySellWrapper,
      },
      {
        components: ['userBalance'],
        container: S.UserBalanceWrapper,
      },
    ],
    container: S.Column1,
  },
  {
    rows: [
      {
        components: ['orderBook'],
        container: S.OrderBookWrapper,
      },
    ],
    container: S.Column2,
  },
  {
    rows: [
      {
        components: ['assetPairCard'],
        container: S.AssetPairCardWrapper,
      },
      {
        components: ['tradingChart'],
        container: S.TradingChartWrapper,
      },
      {
        components: ['userOpenOrders'],
        container: S.UserOpenOrdersWrapper,
      },
    ],
    container: S.Column3,
  },
];

const renderLayout = children => columns.map(({ rows, container }) => {
  const renderedRows = rows.map((row) => {
    const renderedElements = children
      .filter(child => row.components.some(c => c === child.key));
    return React.createElement(
      row.container,
      {},
      renderedElements,
    );
  });
  return React.createElement(
    container,
    {},
    renderedRows,
  );
});

const TradingPageLayout = ({ children }: Props) => {
  console.log(children);

  return (
    <S.TradingPage>
      {renderLayout(children)}
    </S.TradingPage>
  );
};

export default TradingPageLayout;
