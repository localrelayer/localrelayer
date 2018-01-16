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
