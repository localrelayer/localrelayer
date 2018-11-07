// @flow
import type {
  State,
  UiStateKey,
} from '../types';
import {
  createSelector,
} from 'reselect';
import {
  getResourceMap,
} from 'instex-core/selectors';


export function getUiState<UK: UiStateKey>(
  key: UK,
): (State) => $ElementType<$PropertyType<State, 'ui'>, UK> {
  return state => (
    state.ui[key]
  );
}
