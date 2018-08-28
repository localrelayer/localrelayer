// @flow
import type {
  State,
  UiStateKey,
} from '../types';


export function getUiState<UK: UiStateKey>(
  key: UK,
): (State) => $ElementType<$PropertyType<State, 'ui'>, UK> {
  return state => (
    state.ui[key]
  );
}
