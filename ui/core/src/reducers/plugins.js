export const multipleLists = resourceType => (state, action) => {
  const {
    resources,
    lists = [],
    prepend,
    removeFromOtherLists,
  } = action;

  if (action.resourceType !== resourceType) {
    return state;
  }
  // Go throught all other lists and remove resources

  const resourcesIsUndefined = typeof resources === 'undefined';
  const hasResources = resources && resources.length;

  const otherLists = Object.keys(state.lists).filter(listName => !lists.includes(listName));

  const newOtherLists = otherLists.reduce((acc, listName) => {
    const resourcesIds = state.lists[listName];
    if (hasResources) {
      const ids = resources.map(r => r.id);
      const filtered = resourcesIds.filter(resourceId => !ids.includes(resourceId));
      acc[listName] = filtered;
      return acc;
    }
    acc[listName] = resourcesIds;
    return acc;
  }, {});

  let newLists = removeFromOtherLists ? { ...newOtherLists } : { ...state.lists };

  lists.forEach((list) => {
    const currentList = state.lists[list] || [];
    let newList;

    if (action.mergeListIds === false) {
      if (hasResources) {
        newList = resources.map(resource => (typeof resource === 'object' ? resource.id : resource));
      } else if (!resourcesIsUndefined) {
        newList = [];
      }
    } else if (hasResources) {
      newList = Array.prototype.slice.call(currentList);

      resources.forEach((resource) => {
        const id = typeof resource === 'object' ? resource.id : resource;
        if (!newList.includes(id)) {
          if (prepend) {
            newList.unshift(id);
          } else {
            newList.push(id);
          }
        }
      });
    }
    newLists = {
      ...newLists,
      [list]: newList || currentList,
    };
  });
  return {
    ...state,
    lists: newLists,
  };
};
