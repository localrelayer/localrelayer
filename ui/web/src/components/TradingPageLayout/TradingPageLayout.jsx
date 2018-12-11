// @flow
import React from 'react';
import * as S from './styled';

type Props = {
  children: React.Node,
}

const tradingPageColumns = [
  {
    rows: [
      {
        component: 'buySell',
        container: S.BuySellWrapper,
      },
      {
        component: 'userBalance',
        container: S.UserBalanceWrapper,
      },
    ],
    container: S.Column1,
    key: 'column1',
  },
  {
    rows: [
      {
        component: 'orderBook',
        container: S.OrderBookWrapper,
      },
    ],
    container: S.Column2,
    key: 'column2',
  },
  {
    rows: [
      {
        component: 'assetPairCard',
        container: S.AssetPairCardWrapper,
      },
      {
        component: 'tradingChart',
        container: S.TradingChartWrapper,
      },
      {
        component: 'userOpenOrders',
        container: S.UserOpenOrdersWrapper,
      },
    ],
    container: S.Column3,
    key: 'column3',
  },
];

export const renderLayout = (columns, children) => columns.map(({ rows, container, key }) => {
  const renderedRows = rows.map((row) => {
    const renderedElements = children
      .filter(child => row.component === child.key);
    return React.createElement(
      row.container,
      {
        key: row.component,
      },
      renderedElements,
    );
  });
  return React.createElement(
    container,
    {
      key,
    },
    renderedRows,
  );
});

const TradingPageLayout = ({ children }: Props) => (
  <S.TradingPage>
    {renderLayout(tradingPageColumns, children)}
  </S.TradingPage>
);

export default TradingPageLayout;
