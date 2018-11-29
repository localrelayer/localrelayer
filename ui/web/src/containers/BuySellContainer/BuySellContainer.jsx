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
} from 'web-selectors';
import {
  coreActions,
  coreSelectors as cs,
  utils,
} from 'instex-core';

const BuySellContainer = (): Node => (
  <Component
    mapStateToProps={state => ({
      currentAssetPair: getCurrentAssetPairWithBalance(state),
      makerAddress: cs.getWalletState('selectedAccount')(state),
    })}
  >
    {({
      currentAssetPair,
      makerAddress,
      dispatch,
    }) => (
      <BuySell
        currentAssetPair={currentAssetPair}
        onSubmitOrder={({
          amount,
          price,
          formActions,
          type,
        }) => (
          dispatch(coreActions.postOrderRequest({
            formActions,
            order: {
              type,
              makerAddress: makerAddress.toLowerCase(),
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
              expirationTimeSeconds: (
                // + 1 year
                new BigNumber(Math.floor(+Date.now() / 1000)).plus(3 * (10 ** 7))
              ),
            },
          }))
        )}
      />
    )}
  </Component>
);

export default BuySellContainer;
