// @flow
import React from 'react';
import {
  Icon,
  Tooltip,
} from 'antd';
import {
  uiActions,
} from 'web-actions';
import {
  getUiState,
} from 'web-selectors';
import Component from 'web-components/ConnectComponent';
import BuySellForm from './BuySellForm';
import * as S from './styled';

type Props = {
  currentAssetPair: any,
  onSubmitOrder: Function,
};

const BuySell = ({
  currentAssetPair,
  onSubmitOrder,
}: Props) => (
  <S.BuySell>
    <S.BuySellCard
      bordered={false}
    >
      <Component
        mapStateToProps={state => ({
          currentBuySellTab: getUiState('currentBuySellTab')(state),
        })}
      >
        {({
          currentBuySellTab,
          dispatch,
        }) => (
          <S.BuySellTabs
            animated={false}
            defaultActiveKey={currentBuySellTab}
            onChange={activeKey => dispatch(uiActions.setUiState({
              currentBuySellTab: activeKey,
            }))}
            tabBarExtraContent={(
              currentBuySellTab === 'buy'
                ? (
                  <S.TabsExtraContent>
                    <Icon type="wallet" />
                    {' '}
                    {currentAssetPair?.assetDataA?.assetData?.symbol}
                    {' '}
                    <Tooltip title={currentAssetPair?.assetDataA?.balance}>
                      {currentAssetPair?.assetDataA?.balance}
                    </Tooltip>
                  </S.TabsExtraContent>
                )
                : (
                  <S.TabsExtraContent>
                    <Icon type="wallet" />
                    {' '}
                    {currentAssetPair?.assetDataB?.assetData?.symbol}
                    {' '}
                    <Tooltip title={currentAssetPair?.assetDataB?.balance}>
                      {currentAssetPair?.assetDataB?.balance}
                    </Tooltip>
                  </S.TabsExtraContent>
                )
            )}
          >
            <S.BuySellTabs.TabPane tab="Buy" key="buy">
              <BuySellForm
                type="buy"
                onSubmitOrder={onSubmitOrder}
                currentBalance={currentAssetPair?.assetDataB?.balance}
                currentBuySellTab={currentBuySellTab}
              />
            </S.BuySellTabs.TabPane>
            <S.BuySellTabs.TabPane tab="Sell" key="sell">
              <BuySellForm
                type="sell"
                onSubmitOrder={onSubmitOrder}
                currentBalance={currentAssetPair?.assetDataA?.balance}
                currentBuySellTab={currentBuySellTab}
              />
            </S.BuySellTabs.TabPane>
          </S.BuySellTabs>
        )}
      </Component>
    </S.BuySellCard>
  </S.BuySell>
);

export default BuySell;
