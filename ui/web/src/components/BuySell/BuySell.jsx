// @flow
import React from 'react';
import {
  Icon,
} from 'antd';
import * as S from './styled';
import BuySellForm from './BuySellForm';

const BuySell = () => (
  <S.BuySell>
    <S.BuySellCard
      bordered={false}
    >
      <S.BuySellTabs
        animated={false}
        defaultActiveKey="buy"
        tabBarExtraContent={(
          <S.TabsExtraContent>
            <Icon type="wallet" />
            {' '}
            WETH 0
          </S.TabsExtraContent>
        )}
      >
        <S.BuySellTabs.TabPane tab="Buy" key="buy">
          <BuySellForm type="buy" />
        </S.BuySellTabs.TabPane>
        <S.BuySellTabs.TabPane tab="Sell" key="sell">
          <BuySellForm type="sell" />
        </S.BuySellTabs.TabPane>
      </S.BuySellTabs>
    </S.BuySellCard>
  </S.BuySell>
);

export default BuySell;
