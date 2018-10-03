// @flow

import React from 'react';

import type {
  Node,
} from 'react';

import {
  coreSelectors as cs,
} from 'instex-core';
import Component from 'web-components/ConnectComponent';
import Header from 'web-components/Header';

const HeaderContainer = (): Node => (
  <Component
    mapStateToProps={state => ({
      tokensInfo: cs.getTokensInfoMock(state),
    })}
  >
    {({ tokensInfo }) => (
      <Header
        tokensInfo={tokensInfo}
      />
    )}
  </Component>
);

export default HeaderContainer;
