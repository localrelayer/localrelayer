// @flow

import React from 'react';
import { connect } from 'react-redux';
import type { MapStateToProps } from 'react-redux';
import {
  getCurrentPair,
  getCurrentToken,
} from 'instex-core/selectors';
import {
  createOrder,
  fillField,
} from 'instex-core/actions';

import type { Dispatch } from 'redux';

import BuySell from '../../components/BuySell';
import { StyleContainer } from './styled';

type Props = {
  currentTokenName: string,
  currentPairName: string,
  dispatch: Dispatch<*>,
}

const BuySellContainer = ({
  currentTokenName,
  currentPairName,
  dispatch,
}: Props) => (
  <StyleContainer>
    <BuySell
      currentTokenName={currentTokenName}
      currentPairName={currentPairName}
      onSubmit={(...data) => dispatch(createOrder(...data))}
      fillField={(...data) => dispatch(fillField(...data))}
    />
  </StyleContainer>
);

const mapStateToProps: MapStateToProps<*, *, *> = state => ({
  currentTokenName: getCurrentToken(state).symbol,
  currentPairName: getCurrentPair(state).symbol,
});

export default connect(mapStateToProps)(BuySellContainer);
