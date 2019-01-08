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
import {
  Overlay,
} from '../SharedStyledComponents';

type Props = {
  currentAssetPair: any,
  onSubmitOrder: Function,
  bestOrders: any,
  isWeb3ProviderPresent: boolean,
  isNetworkSupported: boolean,
};

const BuySell = ({
  currentAssetPair,
  bestOrders,
  onSubmitOrder,
  isWeb3ProviderPresent,
  isNetworkSupported,
}: Props) => (
  <S.BuySell
    id="buySellForm"
  >
    <Overlay isShown={!isWeb3ProviderPresent}>
      <div>Connect a wallet to create orders</div>
    </Overlay>
    <Overlay isShown={isWeb3ProviderPresent && !isNetworkSupported}>
      <div>Choose supported network</div>
    </Overlay>
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
                bestOrders={bestOrders}
                baseSymbol={currentAssetPair?.assetDataA?.assetData?.symbol}
                quoteSymbol={currentAssetPair?.assetDataB?.assetData?.symbol}
                currentBalance={currentAssetPair?.assetDataB?.availableBalance}
                onSubmitOrder={onSubmitOrder}
                currentBuySellTab={currentBuySellTab}
                currentOrder={currentOrder}
                minAmount={currentAssetPair?.assetDataB?.unitMinAmount}
                maxAmount={currentAssetPair?.assetDataB?.unitMaxAmount}
              />
            </S.BuySellTabs.TabPane>
            <S.BuySellTabs.TabPane
              key="ask"
              tab="Sell"
            >
              <BuySellForm
                type="ask"
                bestOrders={bestOrders}
                baseSymbol={currentAssetPair?.assetDataA?.assetData?.symbol}
                quoteSymbol={currentAssetPair?.assetDataB?.assetData?.symbol}
                currentBalance={currentAssetPair?.assetDataA?.availableBalance}
                onSubmitOrder={onSubmitOrder}
                currentBuySellTab={currentBuySellTab}
                currentOrder={currentOrder}
                minAmount={currentAssetPair?.assetDataB?.unitMinAmount}
                maxAmount={currentAssetPair?.assetDataB?.unitMaxAmount}
              />
            </S.BuySellTabs.TabPane>
          </S.BuySellTabs>
        )}
      </Component>
    </S.BuySellCard>
  </S.BuySell>
);

export default BuySell;
