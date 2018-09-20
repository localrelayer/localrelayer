// @flow
import type {
  UiAction,
} from '../types';

import {
  actionTypes,
} from '.';

export const setUiState = (
  key: any,
  values: any,
  deepMergeKeys: Array<string> = [],
): UiAction => ({
  type: actionTypes.SET_UI_STATE,
  payload: {
    key,
    values,
  },
  meta: {
    deepMergeKeys,
  },
});
