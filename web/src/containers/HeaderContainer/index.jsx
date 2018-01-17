// @flow
import React from 'react';
import {
  connect,
} from 'react-redux';

import type {
  Node,
  StatelessFunctionalComponent,
} from 'react';
import type {
  User,
  Tokens,
} from 'instex-core/types';

import {
  getTokens,
} from 'instex-core/selectors';
import {
  testUser,
} from '../../utils/mocks';

import Header from '../../components/Header';


type Props = {
  user: User,
  tokens: Tokens,
};

const HeaderContainer: StatelessFunctionalComponent<Props> = ({
  user,
  tokens,
}: Props): Node =>
  <Header
    user={user}
    tokens={tokens}
  />;


function mapStateToProps(state) {
  return {
    tokens: getTokens(state),
    user: testUser,
  };
}

export default connect(mapStateToProps)(HeaderContainer);
