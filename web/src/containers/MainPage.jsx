// @flow

import React from 'react';
import {
  Layout,
  Alert,
} from 'antd';
import {
  connect,
} from 'react-redux';
import type {
  MapStateToProps,
} from 'react-redux';

import Header from './HeaderContainer';
import TradingPage from './TradingPage';

type Props = {
  bannerMessage: string,
};

const MainPage = ({ bannerMessage }: Props) =>
  <Layout>
    <Header />
    {bannerMessage && <Alert message={bannerMessage} banner />}
    <TradingPage />
  </Layout>;

const mapStateToProps: MapStateToProps<*, *, *> = state => ({
  bannerMessage: state.ui.bannerMessage,
});

export default connect(mapStateToProps)(MainPage);

