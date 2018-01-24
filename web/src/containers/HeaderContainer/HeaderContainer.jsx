// @flow
import React from 'react';
import {
  connect,
} from 'react-redux';
import {
  bindActionCreators,
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
  setCurrentToken,
  setCurrentPair,
  setSearchQuery,
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
  setCurrentTokenAction: (tokenId: string) => void,
  setCurrentPairAction: (tokenId: string) => void,
  setSearchQueryAction: (searchQuery: string) => void,
  tokenPair: Token
};

const HeaderContainer: StatelessFunctionalComponent<Props> =
  ({
    user,
    tokens,
    selectedToken,
    setCurrentTokenAction,
    setCurrentPairAction,
    setSearchQueryAction,
    tokenPair,
  }: Props): Node =>
    <Header
      user={user}
      tokens={tokens}
      tokenPair={tokenPair}
      selectedToken={selectedToken}
      onTokenSelect={token => setCurrentTokenAction(token.id)}
      onPairSelect={token => setCurrentPairAction(token.id)}
      onTokenSearch={setSearchQueryAction}
    />;

const mapStateToProps = state => ({
  tokens: getFilteredTokens(state),
  user: state.profile,
  selectedToken: getCurrentToken(state),
  tokenPair: getCurrentPair(state),
});

const mapDispatchToProps = dispatch =>
  bindActionCreators({
    setCurrentTokenAction: setCurrentToken,
    setCurrentPairAction: setCurrentPair,
    setSearchQueryAction: setSearchQuery,
  }, dispatch);

export default connect(mapStateToProps, mapDispatchToProps)(HeaderContainer);
