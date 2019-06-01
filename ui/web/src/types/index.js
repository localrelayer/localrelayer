// @flow
import type {
  Store as ReduxStore,
  Dispatch as ReduxDispatch,
} from 'redux';


import type {
  ResourcesState,
  ResourcesAction,
} from 'localrelayer-core/types';

import type {
  UiAction,
  UiState,
} from './ui';

export * from './ui';

export type Action =
  UiAction |
  ResourcesAction;

type WebState = {|
  ui: UiState,
|};

export type State = WebState & ResourcesState;

export type Store = ReduxStore<State, Action>;
export type Dispatch = ReduxDispatch<Action>;
