import React from 'react';
import {
  storiesOf,
} from '@storybook/react';

import TradingPageLayout from '..';
import {
  StyledDiv,
} from '../styled';

storiesOf('TradingPageLayout', module)
  .add('trading-page-layout-default', () => (
    <TradingPageLayout>
      <StyledDiv key="assetPairCard">
        AssetPairs
      </StyledDiv>

      <StyledDiv key="balance">
        Balance
      </StyledDiv>

      <StyledDiv key="userOrders">
        OpenedOrders
      </StyledDiv>

      <StyledDiv key="chart">
        Charts
      </StyledDiv>

      <StyledDiv key="orderBook">
        OrderBook
      </StyledDiv>

      <StyledDiv key="buySell">
        Buy/Sell
      </StyledDiv>

      <StyledDiv key="history">
        TradingHistory
      </StyledDiv>

      <StyledDiv key="news">
          News
      </StyledDiv>
    </TradingPageLayout>
  ));
