// @flow
import React from 'react';
import {
  connect,
} from 'react-redux';
import type { Dispatch } from 'redux';
import type { MapStateToProps } from 'react-redux';
import type {
  Node,
  StatelessFunctionalComponent,
} from 'react';
import type {
  User,
  Tokens,
  Token,
} from 'instex-core/types';
import {
  push,
} from 'react-router-redux';
import {
  setUiState,
} from 'instex-core/actions';
import {
  getFilteredTokens,
  getCurrentPair,
  getCurrentToken,
} from 'instex-core/selectors';

import Header from '../../components/Header';


type Props = {
  user: User,
  tokens: Tokens,
  selectedToken: Token,
  tokenPair: Token,
  dispatch: Dispatch<*>,
};

const HeaderContainer: StatelessFunctionalComponent<Props> =
  ({
    user,
    tokens,
    selectedToken,
    tokenPair,
    dispatch,
  }: Props): Node =>
    <Header
      user={user}
      tokens={tokens}
      tokenPair={tokenPair}
      selectedToken={selectedToken}
      onTokenSelect={token => dispatch(push(`${token.symbol}-${tokenPair.symbol}`))}
      onPairSelect={token => dispatch(push(`${selectedToken.symbol}-${token.symbol}`))}
      onTokenSearch={query => dispatch(setUiState('searchQuery', query))}
    />;

const mapStateToProps: MapStateToProps<*, *, *> = state => ({
  tokens: getFilteredTokens(state),
  user: state.profile,
  selectedToken: getCurrentToken(state),
  tokenPair: getCurrentPair(state),
});

export default connect(mapStateToProps)(HeaderContainer);
