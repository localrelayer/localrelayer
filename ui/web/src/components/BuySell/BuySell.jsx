// @flow
import React from 'react';
import * as R from 'ramda';
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
                    {R.path(['assetDataA', 'assetData', 'symbol'], currentAssetPair)}
                    {' '}
                    <Tooltip title={R.path(['assetDataA', 'balance'], currentAssetPair)}>
                      {R.path(['assetDataA', 'balance'], currentAssetPair)}
                    </Tooltip>
                  </S.TabsExtraContent>
                )
                : (
                  <S.TabsExtraContent>
                    <Icon type="wallet" />
                    {' '}
                    {R.path(['assetDataB', 'assetData', 'symbol'], currentAssetPair)}
                    {' '}
                    <Tooltip title={R.path(['assetDataB', 'balance'], currentAssetPair)}>
                      {R.path(['assetDataB', 'balance'], currentAssetPair)}
                    </Tooltip>
                  </S.TabsExtraContent>
                )
            )}
          >
            <S.BuySellTabs.TabPane tab="Buy" key="buy">
              <BuySellForm
                type="buy"
                onSubmitOrder={onSubmitOrder}
                currentBalance={R.path(['assetDataB', 'balance'], currentAssetPair)}
                currentBuySellTab={currentBuySellTab}
              />
            </S.BuySellTabs.TabPane>
            <S.BuySellTabs.TabPane tab="Sell" key="sell">
              <BuySellForm
                type="sell"
                onSubmitOrder={onSubmitOrder}
                currentBalance={R.path(['assetDataA', 'balance'], currentAssetPair)}
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
