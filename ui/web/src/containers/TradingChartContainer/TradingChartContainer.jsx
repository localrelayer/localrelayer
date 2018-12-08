// @flow
import React from 'react';
import Component from 'web-components/ConnectComponent';
import TradingChart from 'web-components/TradingChart';

import {
  api,
  coreSelectors as cs,
} from 'instex-core';
import {
  chartActions,
} from 'web-actions';
import {
  getCurrentAssetPair,
} from 'web-selectors';


const TradingChartContainer = () => (
  <Component
    mapStateToProps={state => ({
      assetPair: getCurrentAssetPair(state),
      networkId: cs.getWalletState('networkId')(state),
    })}
  >
    {({
      assetPair,
      networkId,
      dispatch,
    }) => (
      assetPair
        ? (
          <TradingChart
            assetPair={assetPair}
            networkId={networkId}
            getBars={api.getBars}
            onSubscribeBars={(chartBarCallback) => {
              dispatch(
                chartActions.subscribeOnChangeChartBar(
                  chartBarCallback,
                  assetPair,
                ),
              );
            }}
          />
        ) : (
          <div>Loading...</div>
        )
    )}
  </Component>
);

export default TradingChartContainer;
