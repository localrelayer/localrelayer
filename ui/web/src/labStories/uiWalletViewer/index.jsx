// @flow
import React from 'react';
import {
  storiesOf,
} from '@storybook/react';
import ReactJson from 'react-json-view';

import Component from 'web-components/ConnectComponent';


storiesOf('Lab|wallet', module)
  .add(
    'ui -> wallet reducer viewer',
    () => (
      <Component
        mapStateToProps={state => ({
          wallet: state.wallet,
        })}
      >
        {({ wallet }) => (
          <ReactJson
            collapsed={false}
            theme="ocean"
            src={wallet}
          />
        )}
      </Component>
    ),
  );
