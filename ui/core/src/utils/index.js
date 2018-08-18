export const capitalizeFirstLetter = s => `${s.charAt(0).toUpperCase()}${s.slice(1)}`;

const isArray = data =>
  Object.prototype.toString.call(data) === '[object Array]';

function reduceJsonApiDataList(result, entry) {
  return {
    ...result,
    [entry.type]: {
      byId: {
        ...(result[entry.type] && result[entry.type].byId),
        [entry.id]: {
          id: entry.id,
          attributes: entry.attributes,
          relationships: {
            ...Object.keys(entry.relationships || {}).reduce(
              (relations, key) => ({
                ...relations,
                [key]: isArray(entry.relationships[key].data)
                  ? entry.relationships[key].data.map(relationData => relationData.id)
                  : entry.relationships[key].data.id,
              }),
              {},
            ),
          },
        },
      },
      ids: ((result[entry.type] && result[entry.type].ids) || []).concat(entry.id),
    },
  };
}

export const jsonApiNormalize = entry =>
  (entry.data.length ? entry.data : [entry.data])
    .concat(entry.included || [])
    .reduce(reduceJsonApiDataList, {});

export const promote = (targetField, targetValue, arr) => {
  const clonedArr = [...arr];
  for (let i = 0; i < clonedArr.length; i++) { // eslint-disable-line
    if (clonedArr[i][targetField] === targetValue) {
      const a = clonedArr.splice(i, 1); // removes the item
      clonedArr.unshift(a[0]); // adds it back to the beginning
      break;
    }
  }
  return clonedArr;
  // Matching item wasn't found. Array is unchanged, but you could do something
  // else here if you wish (like an error message).
};


export const promiseTimeout = (ms, promise) => {
  // Create a promise that rejects in <ms> milliseconds
  const timeout = new Promise((resolve, reject) => {
    const id = setTimeout(() => {
      clearTimeout(id);
      reject(new Error(`Timed out in ${ms}ms.`));
    }, ms);
  });

  // Returns a race between our timeout and the passed in promise
  return Promise.race([promise, timeout]);
};
