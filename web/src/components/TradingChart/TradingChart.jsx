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
  componentDidMount() {
    if (this.props.token.id) {
      this.initalizedChartWidget(this.props.token);
    }
  }

  componentWillReceiveProps(nextProps: Props) {
    if (nextProps.token.id !== this.props.token.id) {
      this.initalizedChartWidget(nextProps.token);
    }
  }

  initalizedChartWidget = (token: Token) => {
    // eslint-disable-next-line
    const widget = new window.TradingView.widget({
      debug: true,
      interval: '60',
      allow_symbol_change: false,
      height: window.innerWidth > 1800 ? '700px' : '450px',
      width: '100%',
      container_id: 'chart_container',
      datafeed: getDatafeed(token),
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
        'paneProperties.topMargin': 15,
        'paneProperties.bottomMargin': 25,
      },

    });
    window.tv_widget = widget;
  }

  render() {
    return <div
      style={{
      minHeight: window.innerWidth > 1800 ? '700px' : '450px',
    }}
      id="chart_container"
    />;
  }
}

function getParameterByName(name) {
  const newName = name.replace(/[[]/, '\\[').replace(/[\]]/, '\\]');
  const regex = new RegExp(`[\\?&]${newName}=([^&#]*)`);
  const results = regex.exec(window.location.search);
  return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
}
