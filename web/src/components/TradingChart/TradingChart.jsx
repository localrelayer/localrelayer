// @flow
import React, { Component } from 'react';
import type {
  Token,
} from 'instex-core/types';
import {
  getDatafeed,
} from './Datafeed';

type Props = {
  token: Token,
};

/**
 * Trading Chart
 * @version 1.0.0
 * @author [Tim Reznich](https://github.com/imbaniac)
 */
export default class extends Component<Props> {
  componentWillReceiveProps(nextProps: Props) {
    if (nextProps.token.id !== this.props.token.id) {
      // eslint-disable-next-line
      const widget = new window.TradingView.widget({
        debug: true,
        interval: '30',
        allow_symbol_change: false,
        height: '500px',
        width: '100%',
        container_id: 'chart_container',
        datafeed: getDatafeed(nextProps.token),
        library_path: 'charting_library/',
        locale: getParameterByName('lang') || 'en',
        disabled_features: [
          'use_localstorage_for_settings',
          'left_toolbar',
          'header_symbol_search',
        ],
        client_id: 'tradingview.com',
        user_id: 'public_user_id',
        overrides: {
          'paneProperties.leftAxisProperties.autoScale': false,
          'paneProperties.rightAxisProperties.autoScale': false,
          'paneProperties.leftAxisProperties.autoScaleDisabled': true,
          'paneProperties.rightAxisProperties.autoScaleDisabled': true,
          'mainSeriesProperties.priceAxisProperties.autoScale': false,
        },

      });
      window.tv_widget = widget;
    }
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
