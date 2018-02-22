export const multipleLists = resourceName => (state, action) => {
  const { resources, lists = [], prepend } = action;
  if (action.resourceName !== resourceName) {
    return state;
  }
  const resourcesIsUndefined = typeof resources === 'undefined';
  const hasResources = resources && resources.length;
  let newLists = {
    ...state.lists,
  };
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

