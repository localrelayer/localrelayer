// @flow
import React from 'react';

import type {
  Node,
  StatelessFunctionalComponent,
} from 'react';

import Routes from './routes';

const App: StatelessFunctionalComponent<*> = (): Node => (
  <div>
  
    <Routes />
  </div>
);

export default App;
