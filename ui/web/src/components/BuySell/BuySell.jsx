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
  getCurrentOrder,
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
          currentOrder: getCurrentOrder(state),
        })}
      >
        {({
          currentBuySellTab,
          currentOrder,
          dispatch,
        }) => (
          <S.BuySellTabs
            animated={false}
            activeKey={currentBuySellTab}
            onChange={activeKey => dispatch(uiActions.setUiState({
              currentBuySellTab: activeKey,
            }))}
            tabBarExtraContent={(
              currentBuySellTab === 'bid'
                ? (
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
                : (
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
            )}
          >
            <S.BuySellTabs.TabPane tab="Buy" key="bid">
              <BuySellForm
                type="bid"
                onSubmitOrder={onSubmitOrder}
                currentBalance={currentAssetPair?.assetDataB?.balance}
                currentBuySellTab={currentBuySellTab}
                currentOrder={currentOrder}
              />
            </S.BuySellTabs.TabPane>
            <S.BuySellTabs.TabPane tab="Sell" key="ask">
              <BuySellForm
                type="ask"
                onSubmitOrder={onSubmitOrder}
                currentBalance={currentAssetPair?.assetDataA?.balance}
                currentBuySellTab={currentBuySellTab}
                currentOrder={currentOrder}
              />
            </S.BuySellTabs.TabPane>
          </S.BuySellTabs>
        )}
      </Component>
    </S.BuySellCard>
  </S.BuySell>
);

export default BuySell;
