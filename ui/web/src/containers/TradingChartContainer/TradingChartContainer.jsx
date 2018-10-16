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
    {({ assetPair }) => <TradingChart assetPair={assetPair} />}
  </Component>
);

export default TradingChartContainer;
