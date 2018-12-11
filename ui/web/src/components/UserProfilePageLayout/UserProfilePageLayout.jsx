// @flow
import React from 'react';
import * as S from './styled';
import {
  renderLayout,
} from '../TradingPageLayout/TradingPageLayout';

type Props = {
  children: React.Node,
};

const userProfileColumns = [
  {
    rows: [
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
        component: 'tradingHistory',
        container: S.TradingHistoryWrapper,
      },
      {
        component: 'userOpenOrders',
        container: S.UserOpenOrdersWrapper,
      },
    ],
    container: S.Column2,
    key: 'column2',
  },
];

const UserProfilePageLayout = ({ children }: Props) => (
  <S.UserProfilePage>
    {renderLayout(userProfileColumns, children)}
  </S.UserProfilePage>
);

export default UserProfilePageLayout;
