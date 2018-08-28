// @flow
import {
  actionTypes,
} from '../actions';

// Add new actions using |
export type UiAction =
  {|
    type: typeof actionTypes.SET_UI_STATE,
    payload: {|
      key: string,
      value: any,
    |},
  |};

export type UiState = {|
  [string]: any,
|};

export type UiStateKey = $Subtype<$Keys<UiState>>;
