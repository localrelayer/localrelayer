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
      // debug: true,
      interval: '60',
      allow_symbol_change: false,
      height: '100%',
      width: '100%',
      container_id: 'chart_container',
      datafeed: getDatafeed(token),
      library_path: 'charting_library/',
      locale: getParameterByName('lang') || 'en',
      disabled_features: [
        'use_localstorage_for_settings',
        'left_toolbar',
        'header_symbol_search',
        'header_indicators',
        'border_around_the_chart',
        'header_undo_redo',
        'header_compare',
      ],
      client_id: 'tradingview.com',
      user_id: 'public_user_id',
      custom_css_url: 'chart.css',
      toolbar_bg: '#0f2335',
      overrides: {
        'paneProperties.leftAxisProperties.autoScale': false,
        'paneProperties.rightAxisProperties.autoScale': false,
        'paneProperties.leftAxisProperties.autoScaleDisabled': true,
        'paneProperties.rightAxisProperties.autoScaleDisabled': true,
        'mainSeriesProperties.priceAxisProperties.autoScale': false,
        'paneProperties.topMargin': 15,
        'paneProperties.bottomMargin': 25,
        volumePaneSize: 'small',
        'scalesProperties.fontSize': 10,
        'mainSeriesProperties.candleStyle.upColor': '#719367',
        'mainSeriesProperties.candleStyle.downColor': '#a03756',
        'paneProperties.vertGridProperties.style': 1,
        'paneProperties.horzGridProperties.style': 1,
        'paneProperties.background': '#0f2335',
        'scalesProperties.textColor': 'white',
        'paneProperties.horzGridProperties.color': '#0f2335',
        'paneProperties.vertGridProperties.color': '#0f2335',
        'scalesProperties.backgroundColor': '#0f2335',
        'scalesProperties.lineColor': '#0f2335',
        'mainSeriesProperties.candleStyle.drawBorder': false,
      },
      studies_overrides: {
        'volume.volume.color.0': 'rgba(217, 54, 54, 0.15)',
        'volume.volume.color.1': 'rgba(30, 169, 60, 0.15)',
      },

    });
    window.tv_widget = widget;
  }

  render() {
    return <div style={{ height: '100%' }} id="chart_container" />;
  }
}

function getParameterByName(name) {
  const newName = name.replace(/[[]/, '\\[').replace(/[\]]/, '\\]');
  const regex = new RegExp(`[\\?&]${newName}=([^&#]*)`);
  const results = regex.exec(window.location.search);
  return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
}
