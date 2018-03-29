// @flow
import React from 'react';
import {
  connect,
} from 'react-redux';
import {
  push,
} from 'react-router-redux';

import type {
  Dispatch,
} from 'redux';
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
  setUiState,
} from 'instex-core/actions';
import {
  getFilteredTokens,
  getCurrentPair,
  getCurrentToken,
} from 'instex-core/selectors';

import {
  Header,
} from 'components';


type Props = {
  user: User,
  tokens: Tokens,
  selectedToken: Token,
  tokenPair: Token,
  dispatch: Dispatch<*>,
  activeLink: string,
};

const HeaderContainer: StatelessFunctionalComponent<Props> =
  ({
    user,
    tokens,
    selectedToken,
    tokenPair,
    dispatch,
    activeLink,
  }: Props): Node =>
    <Header
      activeLink={activeLink}
      user={user}
      tokens={tokens}
      tokenPair={tokenPair}
      selectedToken={selectedToken}
      onTokenSelect={
        token =>
          dispatch(
            push(`${token.symbol}-${tokenPair.symbol}`),
          )
      }
      onPairSelect={
        token =>
          dispatch(
            push(`${selectedToken.symbol}-${token.symbol}`),
          )
      }
      onTokenSearch={
        query =>
          dispatch(
            setUiState('searchQuery', query),
          )
      }
      setActiveLink={
        e =>
          dispatch(
            setUiState('activeLink', e.key),
          )
      }
      onHelpClick={
        () =>
          dispatch(
            setUiState('shouldRunTutorial', true),
          )
      }
    />;

const mapStateToProps = state => ({
  tokens: getFilteredTokens(state),
  user: state.profile,
  selectedToken: getCurrentToken(state),
  tokenPair: getCurrentPair(state),
  activeLink: state.ui.activeLink,
});

export default connect(mapStateToProps)(HeaderContainer);
