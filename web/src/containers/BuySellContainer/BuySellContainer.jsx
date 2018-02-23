// @flow

import React from 'react';
import { connect } from 'react-redux';
import type { MapStateToProps } from 'react-redux';
import {
  getCurrentPair,
  getCurrentToken,
  getUserTokenBy,
} from 'instex-core/selectors';
import {
  createOrder,
  fillField,
} from 'instex-core/actions';
import type {
  Token,
} from 'instex-core/types';

import type { Dispatch } from 'redux';

import BuySell from '../../components/BuySell';
import { StyleContainer } from './styled';

type Props = {
  currentToken: Token,
  currentPair: Token,
  dispatch: Dispatch<*>,
}

const BuySellContainer = ({
  currentToken,
  currentPair,
  dispatch,
}: Props) => (
  <StyleContainer>
    <BuySell
      currentToken={currentToken}
      currentPair={currentPair}
      onSubmit={(...data) => dispatch(createOrder(...data))}
      fillField={(...data) => dispatch(fillField(...data))}
    />
  </StyleContainer>
);

const mapStateToProps: MapStateToProps<*, *, *> = (state) => {
  const currentToken = getCurrentToken(state);
  const currentPair = getCurrentPair(state);
  // We need to get current token and pair from profile to get a balance
  return {
    currentToken: getUserTokenBy('id', currentToken.id)(state),
    currentPair: getUserTokenBy('id', currentPair.id)(state),
  };
};

export default connect(mapStateToProps)(BuySellContainer);
