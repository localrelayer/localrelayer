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
                    <Tooltip title={currentAssetPair?.assetDataB?.availableBalance}>
                      {currentAssetPair?.assetDataB?.availableBalance}
                    </Tooltip>
                  </S.TabsExtraContent>
                )
                : (
                  <S.TabsExtraContent>
                    <Icon type="wallet" />
                    {' '}
                    {currentAssetPair?.assetDataA?.assetData?.symbol}
                    {' '}
                    <Tooltip title={currentAssetPair?.assetDataA?.availableBalance}>
                      {currentAssetPair?.assetDataA?.availableBalance}
                    </Tooltip>
                  </S.TabsExtraContent>
                )
            )}
          >
            <S.BuySellTabs.TabPane
              key="bid"
              tab="Buy"
            >
              <BuySellForm
                type="bid"
                baseSymbol={currentAssetPair?.assetDataA?.assetData?.symbol}
                quoteSymbol={currentAssetPair?.assetDataB?.assetData?.symbol}
                onSubmitOrder={onSubmitOrder}
                currentBalance={currentAssetPair?.assetDataB?.availableBalance}
                currentBuySellTab={currentBuySellTab}
                currentOrder={currentOrder}
              />
            </S.BuySellTabs.TabPane>
            <S.BuySellTabs.TabPane
              key="ask"
              tab="Sell"
            >
              <BuySellForm
                type="ask"
                baseSymbol={currentAssetPair?.assetDataA?.assetData?.symbol}
                quoteSymbol={currentAssetPair?.assetDataB?.assetData?.symbol}
                onSubmitOrder={onSubmitOrder}
                currentBalance={currentAssetPair?.assetDataA?.availableBalance}
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
