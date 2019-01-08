// @flow
import React from 'react';

import type {
  Node,
} from 'react';

import {
  getUiState,
} from 'web-selectors';

import Component from 'web-components/ConnectComponent';
import JoyrideWrapper from 'web-components/JoyrideWrapper';


const JoyrideWrapperContainer = (): Node => (
  <Component
    mapStateToProps={state => ({
      isJoyrideVisible: getUiState('isJoyrideVisible')(state),
    })}
  >
    {({ isJoyrideVisible }) => (
      <JoyrideWrapper
        isJoyrideVisible={isJoyrideVisible}
      />
    )}
  </Component>
);

export default JoyrideWrapperContainer;
