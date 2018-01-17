import {
  createSelector,
} from 'reselect';
import * as R from 'ramda';

import {
  resources,
} from '../constants';
import {
  capitalizeFirstLetter as cfl,
} from '../utils';


const getResourceMapSelectorCreator = resourceName => state => state[resourceName].byId;
const getResourceIdsSelectorCreator = resourceName => state => state[resourceName].allIds;

const commonSelectors = resources.reduce(
  (acc, resourceName) =>
    ({
      ...acc,
      [`get${cfl(resourceName)}Map`]: getResourceMapSelectorCreator(resourceName),
      [`get${cfl(resourceName)}Ids`]: getResourceIdsSelectorCreator(resourceName),
    }),
  {},
);

module.exports = resources.reduce(
  (acc, resourceName) =>
    ({
      ...acc,
      [`get${cfl(resourceName)}`]: createSelector(
        [acc[`get${cfl(resourceName)}Map`], acc[`get${cfl(resourceName)}Ids`]],
        (map, ids) => ids.map(id => ({
          ...R.path([id, 'attributes'], map),
          id,
        })),
      ),
    }),
  commonSelectors,
);
