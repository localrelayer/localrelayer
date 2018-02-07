// @flow
import type {
  UiAction,
  UiState,
} from './ui';

import type {
  ProfileAction,
  ProfileState,
} from './profile';

export type ID = string;

export type {
  UiAction,
  UiState,
} from './ui';

export type {
  ProfileAction,
} from './profile';

export type * from './resources';
export type * from './orders';
export type * from './tokens';
export type * from './users';

export type Action =
  UiAction |
  ProfileAction;

export type State =
  UiState &
  ProfileState;
