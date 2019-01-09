// @flow
import React from 'react';
import {
  Icon,
  Tooltip,
  Tabs,
} from 'antd';
import LimitBuySellForm from './LimitBuySellForm';
import MarketBuySellForm from './MarketBuySellForm';
import * as S from './styled';
import {
  Overlay,
} from '../SharedStyledComponents';

type Props = {
  currentAssetPair: any,
  onSubmitLimitOrder: Function,
  onSubmitMarketOrder: Function,
  bestOrders: any,
  isWeb3ProviderPresent: boolean,
  isNetworkSupported: boolean,
  currentOrder: any,
  currentBuySellTab: String,
  setBuySellTab: Function,
  currentMarketLimitTab: String,
  setMarketLimitTab: Function,
  matchedMarketOrders: Array,
  setMarketAmount: Function,
};

const BuySell = ({
  currentAssetPair,
  bestOrders,
  onSubmitLimitOrder,
  onSubmitMarketOrder,
  isWeb3ProviderPresent,
  isNetworkSupported,
  currentOrder,
  currentBuySellTab,
  setBuySellTab,
  currentMarketLimitTab,
  setMarketLimitTab,
  matchedMarketOrders,
  setMarketAmount,
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
      <S.MarketLimitTabs
        animated={false}
        activeKey={currentMarketLimitTab}
        onChange={setMarketLimitTab}
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
        <Tabs.TabPane
          tab="Market"
          key="market"
        >
          <S.BuySellTabs
            type="card"
            animated={false}
            activeKey={currentBuySellTab}
            onChange={setBuySellTab}
          >
            <S.BuySellTabs.TabPane
              key="marketBid"
              tab="Buy"
              type="buy"
            >
              <MarketBuySellForm
                type="bid"
                matchedMarketOrders={matchedMarketOrders}
                baseSymbol={currentAssetPair?.assetDataA?.assetData?.symbol}
                quoteSymbol={currentAssetPair?.assetDataB?.assetData?.symbol}
                currentBalance={currentAssetPair?.assetDataB?.availableBalance}
                onSubmitOrder={onSubmitMarketOrder}
                currentBuySellTab={currentBuySellTab}
                currentOrder={currentOrder}
                minAmount={currentAssetPair?.assetDataB?.unitMinAmount}
                maxAmount={currentAssetPair?.assetDataB?.unitMaxAmount}
                setMarketAmount={setMarketAmount}
              />
            </S.BuySellTabs.TabPane>
            <S.BuySellTabs.TabPane
              key="marketAsk"
              tab="Sell"
              type="sell"
            >
              <MarketBuySellForm
                type="ask"
                matchedMarketOrders={matchedMarketOrders}
                baseSymbol={currentAssetPair?.assetDataA?.assetData?.symbol}
                quoteSymbol={currentAssetPair?.assetDataB?.assetData?.symbol}
                currentBalance={currentAssetPair?.assetDataA?.availableBalance}
                onSubmitOrder={onSubmitMarketOrder}
                currentBuySellTab={currentBuySellTab}
                currentOrder={currentOrder}
                minAmount={currentAssetPair?.assetDataB?.unitMinAmount}
                maxAmount={currentAssetPair?.assetDataB?.unitMaxAmount}
                setMarketAmount={setMarketAmount}
              />
            </S.BuySellTabs.TabPane>
          </S.BuySellTabs>
        </Tabs.TabPane>
        <Tabs.TabPane tab="Limit" key="limit">
          <S.BuySellTabs
            animated={false}
            activeKey={currentBuySellTab}
            onChange={setBuySellTab}
            type="card"
          >
            <S.BuySellTabs.TabPane
              key="limitBid"
              tab="Buy"
            >
              <LimitBuySellForm
                type="bid"
                bestOrders={bestOrders}
                baseSymbol={currentAssetPair?.assetDataA?.assetData?.symbol}
                quoteSymbol={currentAssetPair?.assetDataB?.assetData?.symbol}
                currentBalance={currentAssetPair?.assetDataB?.availableBalance}
                onSubmitOrder={onSubmitLimitOrder}
                currentBuySellTab={currentBuySellTab}
                currentOrder={currentOrder}
                minAmount={currentAssetPair?.assetDataB?.unitMinAmount}
                maxAmount={currentAssetPair?.assetDataB?.unitMaxAmount}
              />
            </S.BuySellTabs.TabPane>
            <S.BuySellTabs.TabPane
              key="limitAsk"
              tab="Sell"
            >
              <LimitBuySellForm
                type="ask"
                bestOrders={bestOrders}
                baseSymbol={currentAssetPair?.assetDataA?.assetData?.symbol}
                quoteSymbol={currentAssetPair?.assetDataB?.assetData?.symbol}
                currentBalance={currentAssetPair?.assetDataA?.availableBalance}
                onSubmitOrder={onSubmitLimitOrder}
                currentBuySellTab={currentBuySellTab}
                currentOrder={currentOrder}
                minAmount={currentAssetPair?.assetDataB?.unitMinAmount}
                maxAmount={currentAssetPair?.assetDataB?.unitMaxAmount}
              />
            </S.BuySellTabs.TabPane>
          </S.BuySellTabs>
        </Tabs.TabPane>
      </S.MarketLimitTabs>
    </S.BuySellCard>
  </S.BuySell>
);

export default BuySell;
