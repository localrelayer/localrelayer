// @flow
import React, { Component } from 'react';

type Props = {};

/**
 * Trading Chart
 * @version 1.0.0
 * @author [Tim Reznich](https://github.com/imbaniac)
 */
export default class extends Component<Props> {
  componentDidMount() {
    // eslint-disable-next-line
    const widget = new window.TradingView.widget({
      height: '500px',
      width: '100%',
      symbol: 'AAPL',
      container_id: 'tv_chart_container',
      datafeed: new window.Datafeeds.UDFCompatibleDatafeed('https://demo_feed.tradingview.com'),
      library_path: 'charting_library/',
      locale: getParameterByName('lang') || 'en',
      drawings_access: { type: 'black', tools: [{ name: 'Regression Trend' }] },
      disabled_features: ['use_localstorage_for_settings', 'left_toolbar'],
      charts_storage_url: 'http://saveload.tradingview.com',
      charts_storage_api_version: '1.1',
      client_id: 'tradingview.com',
      user_id: 'public_user_id',
    });
    window.tv_widget = widget;
  }

  render() {
    return <div id="tv_chart_container" />;
  }
}

function getParameterByName(name) {
  const newName = name.replace(/[[]/, '\\[').replace(/[\]]/, '\\]');
  const regex = new RegExp(`[\\?&]${newName}=([^&#]*)`);
  const results = regex.exec(window.location.search);
  return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
}
