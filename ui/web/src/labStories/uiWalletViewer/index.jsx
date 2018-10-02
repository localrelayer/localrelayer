// @flow
import React from 'react';
import {
  storiesOf,
} from '@storybook/react';
import ReactJson from 'react-json-view';

import {
  getUiState,
} from 'web-selectors';

import Component from 'web-components/ConnectComponent';


storiesOf('Lab|wallet', module)
  .add(
    'ui -> wallet reducer viewer',
    () => (
      <Component
        mapStateToProps={state => ({
          uiWallet: getUiState('wallet')(state),
        })}
      >
        {({ uiWallet }) => (
          <ReactJson
            collapsed={false}
            theme="ocean"
            src={uiWallet}
          />
        )}
      </Component>
    ),
  );
