// @flow
import React from 'react';
import Component from 'web-components/ConnectComponent';
import TradingChart from 'web-components/TradingChart';
import {
  getCurrentAssetPair,
  getUiState,
} from 'web-selectors';

const TradingChartContainer = () => (
  <Component
    mapStateToProps={state => ({
      assetPair: getCurrentAssetPair(state),
      networkId: getUiState('networkId'),
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
        dispatch={dispatch}
      />
    )}
  </Component>
);

export default TradingChartContainer;
