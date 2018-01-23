// I can't desribe types for this file
import {
  combineReducers,
} from 'redux';
import * as R from 'ramda';

import {
  resources,
} from '../constants';


const resourcesReducers =
  resources.reduce(
    (p, c) =>
      ({
        ...p,
        [c]: combineReducers({
          byId: (
            state = {},
            action,
          ) => {
            switch (action.type) {
              case `@@JSONAPI/${c}_FILL`:
                return R.mergeDeepRight(state, action.payload.byId);
              case `@@JSONAPI/${c}_ADD`:
                return R.assoc(action.payload.id, action.payload, state);
              case `@@JSONAPI/${c}_UPDATE`:
                return {
                  ...state,
                  [action.payload.id]: R.mergeDeepRight(state[action.payload.id], action.payload),
                };
              case `@@JSONAPI/${c}_DELETE`:
                return R.dissoc(action.payload.id, state);
              case `@@JSONAPI/${c}_CLEAR`:
              case 'CLEAR_ALL_REDUCERS':
                return {};
              default:
                return state;
            }
          },
          allIds: (state = [], action) => {
            switch (action.type) {
              case `@@JSONAPI/${c}_FILL`:
                return R.union(state, action.payload.ids);
              case `@@JSONAPI/${c}_ADD`:
                return R.prepend(action.payload.id, state);
              case `@@JSONAPI/${c}_DELETE`:
                return R.without([action.payload.id], state);
              case `@@JSONAPI/${c}_CLEAR`:
              case 'CLEAR_ALL_REDUCERS':
                return [];
              default:
                return state;
            }
          },
        }),
      }),
    {},
  );

export default resourcesReducers;
