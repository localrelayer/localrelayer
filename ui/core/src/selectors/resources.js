// @flow
import {
  createSelector,
} from 'reselect';


export const getResourceIds = (
  resourceName: string,
  listName: string,
) => (
  (state: any) => (
    state[resourceName].lists[listName]
  )
);

export const getResourceMap = (resourceName: string) => (
  (state: any) => (
    state[resourceName].resources
  )
);

export const getResourceById = (
  resourceName: string,
  id: string,
) => (
  (state: any) => (
    state[resourceName].resources[id]
  )
);

export const getResourceMeta = (
  resourceName: string,
  metaKey: string,
) => (
  (state: any) => (
    state[resourceName].meta[metaKey]
  )
);

export function getResourceAllIds<T: ResourceType >(
  resourceType: T,
): (State) => Array<ID> {
  return state => (
    Object.keys(state[resourceType].resources)
  );
}

const resourceSelectors = {};

export const getResourceMappedList = (
  resourceName: string,
  listName: string = 'allResources',
) => {
  if (resourceSelectors[resourceName]) {
    return resourceSelectors[`${resourceName}${listName}`];
  }
  resourceSelectors[`${resourceName}${listName}`] = (
    createSelector(
      [
        (
          listName === 'allResources'
            ? getResourceAllIds(resourceName)
            : getResourceIds(resourceName, listName)
        ),
        getResourceMap(resourceName),
      ],
      (ids = [], map) => ids.map(id => map[id]),
    )
  );
  return resourceSelectors[`${resourceName}${listName}`];
};
