// @flow
import {
  BigNumber,
} from '0x.js';
import React from 'react';

import type {
  Node,
} from 'react';

import BuySell from 'web-components/BuySell';
import Component from 'web-components/ConnectComponent';
import {
  getCurrentAssetPairWithBalance,
  getUiState,
  getCurrentOrder,
  getMatchedMarketOrders,
} from 'web-selectors';
import {
  uiActions,
} from 'web-actions';
import {
  coreActions,
  utils,
  coreSelectors as cs,
} from 'localrelayer-core';

const BuySellContainer = (): Node => (
  <Component
    mapStateToProps={state => ({
      currentAssetPair: getCurrentAssetPairWithBalance(state),
      bestOrders: cs.getBestOrders(state),
      isWeb3ProviderPresent: getUiState('isWeb3ProviderPresent')(state),
      isNetworkSupported: getUiState('isNetworkSupported')(state),
      currentBuySellTab: getUiState('currentBuySellTab')(state),
      currentMarketLimitTab: getUiState('currentMarketLimitTab')(state),
      currentOrder: getCurrentOrder(state),
      matchedMarketOrders: getMatchedMarketOrders(state),
    })}
  >
    {({
      currentAssetPair,
      bestOrders,
      dispatch,
      isWeb3ProviderPresent,
      isNetworkSupported,
      currentBuySellTab,
      currentOrder,
      currentMarketLimitTab,
      matchedMarketOrders,
    }) => (
      <BuySell
        isWeb3ProviderPresent={isWeb3ProviderPresent}
        currentAssetPair={currentAssetPair}
        bestOrders={bestOrders}
        isNetworkSupported={isNetworkSupported}
        currentOrder={currentOrder}
        matchedMarketOrders={matchedMarketOrders}
        currentBuySellTab={currentBuySellTab}
        currentMarketLimitTab={currentMarketLimitTab}
        setBuySellTab={activeTab => dispatch(uiActions.setUiState({
          currentBuySellTab: activeTab,
        }))}
        setMarketLimitTab={activeTab => dispatch(uiActions.setUiState({
          currentMarketLimitTab: activeTab,
          currentBuySellTab: `${activeTab}Bid`,
          currentOrderId: null,
        }))
        }
        setMarketAmount={(amount) => {
          console.log(amount);

          dispatch(uiActions.setUiState({
            marketAmount: amount,
          }));
        }}
        onSubmitMarketOrder={(formActions) => {
          dispatch(coreActions.fillOrderRequest({
            ...matchedMarketOrders,
            formActions,
          }));
        }}
        onSubmitLimitOrder={({
          amount,
          price,
          expirationNumber,
          expirationUnit,
          formActions,
          type,
          shouldMatch,
        }) => {
          dispatch(uiActions.setUiState({
            currentOrderId: null,
          }));
          dispatch(coreActions.postOrderRequest({
            formActions,
            shouldMatch,
            order: {
              type,
              takerAddress: utils.NULL_ADDRESS,
              makerAssetAmount: (
                type === 'bid'
                  ? (
                    utils.toBaseUnitAmount(
                      new BigNumber(amount).times(price),
                      currentAssetPair.assetDataB.assetData.decimals,
                    )
                  )
                  : (
                    utils.toBaseUnitAmount(
                      amount,
                      currentAssetPair.assetDataA.assetData.decimals,
                    )
                  )
              ),
              takerAssetAmount: (
                type === 'bid'
                  ? (
                    utils.toBaseUnitAmount(
                      amount,
                      currentAssetPair.assetDataA.assetData.decimals,
                    )
                  )
                  : (
                    utils.toBaseUnitAmount(
                      new BigNumber(amount).times(price),
                      currentAssetPair.assetDataB.assetData.decimals,
                    )
                  )
              ),
              makerAssetData: (
                type === 'bid'
                  ? (
                    currentAssetPair.assetDataB.assetData.id
                  )
                  : (
                    currentAssetPair.assetDataA.assetData.id
                  )
              ),
              takerAssetData: (
                type === 'bid'
                  ? (
                    currentAssetPair.assetDataA.assetData.id
                  )
                  : (
                    currentAssetPair.assetDataB.assetData.id
                  )
              ),
              expirationTimeSeconds: Math.floor(
                (
                  Date.now()
                  + utils.unitTimeToUnix(
                    expirationNumber,
                    expirationUnit,
                  )
                ) / 1000,
              ).toString(),
            },
          }));
        }}
      />
    )}
  </Component>
);

export default BuySellContainer;
