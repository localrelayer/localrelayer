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
} from 'instex-core/types';

import {
  setCurrentToken,
} from 'instex-core/actions';
import {
  getTokens,
} from 'instex-core/selectors';
import Header from '../../components/Header';


type Props = {
  user: User,
  tokens: Tokens,
  selectedTokenId: ?string,
  setCurrentTokenAction: (tokenId: string) => void,
};

const HeaderContainer: StatelessFunctionalComponent<Props> =
  ({
    user,
    tokens,
    selectedTokenId,
    setCurrentTokenAction,
  }: Props): Node =>
    <Header
      user={user}
      tokens={tokens}
      selectedTokenId={selectedTokenId}
      onTokenSelect={token => setCurrentTokenAction(token.id)}
    />;

const mapStateToProps = state => ({
  tokens: getTokens(state),
  user: state.profile,
  selectedTokenId: state.ui.currentTokenId,
});

const mapDispatchToProps = dispatch =>
  bindActionCreators({
    setCurrentTokenAction: setCurrentToken,
  }, dispatch);

export default connect(mapStateToProps, mapDispatchToProps)(HeaderContainer);
