// @flow
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
