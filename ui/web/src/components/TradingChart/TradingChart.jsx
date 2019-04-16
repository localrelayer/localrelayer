// @flow
import React, {
  Component,
} from 'react';
import type {
  AssetPair,
} from 'instex-core/types';

import colors from 'web-styles/colors';
import * as S from './styled';
import {
  getDatafeed,
} from './Datafeed';


type Props = {
  assetPair: AssetPair,
  networkId: any,
  getBars: Function,
  onSubscribeBars: Function,
};

const getParameterByName = (name) => {
  const newName = name.replace(/[[]/, '\\[').replace(/[\]]/, '\\]');
  const regex = new RegExp(`[\\?&]${newName}=([^&#]*)`);
  const results = regex.exec(window.location.search);
  return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
};


export default class extends Component<Props> {
  componentDidMount() {
    const {
      assetPair,
      networkId,
      getBars,
      onSubscribeBars,
    } = this.props;
    if (
      assetPair
      && networkId
    ) {
      this.initalizeChartWidget(
        assetPair,
        networkId,
        getBars,
        onSubscribeBars,
      );
    }
  }

  componentWillReceiveProps(nextProps: Props) {
    const {
      assetPair,
      getBars,
      onSubscribeBars,
    } = this.props;
    if (
      nextProps.assetPair
      && nextProps.networkId
      && (nextProps.assetPair.id !== assetPair?.id)
    ) {
      this.initalizeChartWidget(
        nextProps.assetPair,
        nextProps.networkId,
        getBars,
        onSubscribeBars,
      );
    }
  }

  initalizeChartWidget = (
    assetPair: AssetPair,
    networkId: any,
    getBars: Function,
    onSubscribeBars: Function,
  ) => {
    // eslint-disable-next-line
    const widget = new window.TradingView.widget({
      // debug: true,
      interval: '60',
      allow_symbol_change: false,
      height: '100%',
      width: '100%',
      container_id: 'chart_container',
      datafeed: (
        getDatafeed(
          assetPair,
          networkId,
          getBars,
          onSubscribeBars,
        )
      ),
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
      toolbar_bg: colors['component-background'],
      theme: 'Dark',
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
        'mainSeriesProperties.candleStyle.upColor': colors.green,
        'mainSeriesProperties.candleStyle.downColor': colors.red,
        'paneProperties.vertGridProperties.style': 1,
        'paneProperties.horzGridProperties.style': 1,
        'paneProperties.background': colors['component-background'],
        'scalesProperties.textColor': 'white',
        'paneProperties.horzGridProperties.color': colors['component-background'],
        'paneProperties.vertGridProperties.color': colors['component-background'],
        'scalesProperties.backgroundColor': colors['component-background'],
        'scalesProperties.lineColor': colors['component-background'],
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
    return <S.Chart id="chart_container" />;
  }
}
