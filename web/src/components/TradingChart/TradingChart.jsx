// @flow
import React, { Component } from 'react';

import datafeed from './Datafeed';

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
      debug: true,
      symbol: 'ZRX',
      interval: '30',
      allow_symbol_change: false,
      height: '500px',
      width: '100%',
      container_id: 'chart_container',
      datafeed,
      library_path: 'charting_library/',
      locale: getParameterByName('lang') || 'en',
      drawings_access: { type: 'black', tools: [{ name: 'Regression Trend' }] },
      disabled_features: [
        'use_localstorage_for_settings',
        'left_toolbar',
        'header_symbol_search',
      ],
      client_id: 'tradingview.com',
      user_id: 'public_user_id',
      favorites: {
        intervals: [
          '1',
          '10',
          '30',
          '60',
          'D',
          '7D',
          '30D',
        ],
      },
    });
    window.tv_widget = widget;
  }

  render() {
    return <div id="chart_container" />;
  }
}

function getParameterByName(name) {
  const newName = name.replace(/[[]/, '\\[').replace(/[\]]/, '\\]');
  const regex = new RegExp(`[\\?&]${newName}=([^&#]*)`);
  const results = regex.exec(window.location.search);
  return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
}
