// @flow
import React from 'react';
import {
  connect,
} from 'react-redux';
import type {
  MapStateToProps,
} from 'react-redux';
import {
  getCurrentToken,
} from 'instex-core/selectors';
import type {
  Token,
} from 'instex-core/types';
import TradingChart from '../../components/TradingChart';
import { StyleContainer } from './styled';


type Props = {
  token: Token,
}

const TradingChartContainer = ({ token }: Props) => (
  <StyleContainer>
    <TradingChart token={token} />
  </StyleContainer>
);

const mapStateToProps: MapStateToProps<*, *, *> = state => ({
  token: getCurrentToken(state),
});

export default connect(mapStateToProps)(TradingChartContainer);
