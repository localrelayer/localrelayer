// @flow
import React from 'react';
import Component from 'web-components/ConnectComponent';
import TradingChart from 'web-components/TradingChart';

import {
  api,
} from 'instex-core';
import {
  chartActions,
} from 'web-actions';
import {
  getCurrentAssetPair,
  getUiState,
} from 'web-selectors';


const TradingChartContainer = () => (
  <Component
    mapStateToProps={state => ({
      assetPair: getCurrentAssetPair(state),
      networkId: getUiState('networkId')(state),
    })}
  >
    {({
      assetPair,
      networkId,
      dispatch,
    }) => (
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
    )}
  </Component>
);

export default TradingChartContainer;
