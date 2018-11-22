// @flow
import React from 'react';
import Component from 'web-components/ConnectComponent';
import TradingChart from 'web-components/TradingChart';
import {
  getCurrentAssetPair,
} from 'web-selectors';

const TradingChartContainer = () => (
  <Component
    mapStateToProps={state => ({
      assetPair: getCurrentAssetPair(state),
    })}
  >
    {({ assetPair, dispatch }) => (
      <TradingChart
        assetPair={assetPair}
        dispatch={dispatch}
      />
    )}
  </Component>
);

export default TradingChartContainer;
