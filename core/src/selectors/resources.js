// @flow
import {
  createSelector,
} from 'reselect';


export const getResourceIds = (
  resourceName: string,
  listName: string,
) =>
  (state: any) =>
    state[resourceName].lists[listName];

export const getResourceMap = (resourceName: string) =>
  (state: any) =>
    state[resourceName].resources;

export const getResourceMeta = (
  resourceName: string,
  metaKey: string,
) =>
  (state: any) =>
    state[resourceName].meta[metaKey];

const resourceSelectors = {};

export const getResourceMappedList = (
  resourceName: string,
  listName: string,
) => {
  if (resourceSelectors[resourceName]) {
    return resourceSelectors[`${resourceName}${listName}`];
  }
  resourceSelectors[`${resourceName}${listName}`] =
    createSelector(
      [
        getResourceIds(resourceName, listName),
        getResourceMap(resourceName),
      ],
      (ids = [], map) => ids.map(id => ({
        ...map[id].attributes,
        relationships: map[id].relationships,
        id,
      })),
    );
  return resourceSelectors[`${resourceName}${listName}`];
};

export const getResourceItemBydId = (
  resourceName: string,
  id: string,
) =>
  (state: any) => (id && state[resourceName].resources[id] ?
    ({
      ...state[resourceName].resources[id].attributes,
      id,
    })
    :
    {});
