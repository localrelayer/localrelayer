import _ from 'lodash';
import {
  pgBookshelf as pg,
} from '../db';
import * as models from '../models';


// TODO: Unsecure behaviour on hasMany relation, allows to relate any object
// knowing id
export async function saveResource({
  model,
  transaction,
  allModels,
  attributes,
  relationships,
  allowedCreateRelationships,
  allowedUpdateRelationships,
  options = {},
}) {
  let resource = null;
  await pg.transaction(async (t) => {
    const transacting = transaction || t;
    resource = await model.forge(attributes).save(null, { transacting, ...options });
    const mapRelations = relationships ? Object.keys(relationships).reduce((p, c) => {
      const relationName = c;
      const data = relationships[relationName].data;
      const relationValue = _.isArray(data) ? data.filter(i => i.type === relationName) : [data];
      const prevValue = p[relationName] || { create: [], update: [] };

      const withId = relationValue.filter(i => i.id).map(i => i.id);
      const withoutId = relationValue.filter(i => !i.id);
      return {
        ...p,
        [relationName]: {
          create: [
            ...prevValue.create,
            ...withoutId,
          ],
          update: [
            ...prevValue.update,
            ...withId,
          ],
          type: resource.related(relationName).relatedData.type,
          foreignKey: resource.related(relationName).relatedData.foreignKey,
        }
      };
    }, {}) : [];

    /*
    await Promise.all(Object.keys(mapRelations).map(async (relationName) => {
      const relation = mapRelations[relationName];
      const relationType = relation.type;
      const relationForeignKey = relation.foreignKey;
      console.log(relation);
      console.log(relationType);
    }));
    */

    // TODO: refactor without cycle
    for (const relationName of Object.keys(mapRelations)) {
      const relation = mapRelations[relationName];
      const relationType = resource.related(relationName).relatedData.type;
      const relationForeignKey = resource.related(relationName).relatedData.foreignKey;

      let relatedItems = [];
      if (allowedUpdateRelationships.includes(relationName)) {
        relatedItems = [
          ...relation.update
        ];
      }

      if (relation.create.length && allowedCreateRelationships.includes(relationName)) {
        const type = relation.create[0].type;
        const collection = pg.Collection.extend({
          model: allModels ? allModels[type] : models[type]
        }).forge(relation.create.map((i) => { // eslint-disable-line no-loop-func
          const attrs = i.attributes;
          if (relationType === 'hasMany') {
            return {
              ...attrs,
              [relationForeignKey]: resource.get('id'),
            };
          }
          return attrs;
        }));
        const newIds = await collection.invokeThen('save', null, { transacting });
        relatedItems = [
          ...relatedItems,
          ...newIds.map(i => i.id),
        ];
      }

      if (relatedItems.length && relationType === 'belongsToMany') {
        await resource.related(relationName).detach(null, { transacting });
        await resource.related(relationName).attach(relatedItems, { transacting });
      }
      if (relationType === 'belongsTo') {
        await resource.save({ [relationForeignKey]: relatedItems[0] }, { transacting });
      }
      if (relationType === 'hasMany') {
        const currentRelatedItems = await resource.related(relationName).fetch({ transacting });
        const currentRelatedItemsIds = currentRelatedItems.map(i => i.id);
        const newRelatedItemsIds = relatedItems.map(i => (i.id || i));

        const addRelation = newRelatedItemsIds.filter(i => !currentRelatedItemsIds.includes(i));
        const clearRelation = currentRelatedItemsIds.filter(i => !newRelatedItemsIds.includes(i));
        const collection = pg.Collection.extend({
          model: allModels ? allModels[relationName] : models[relationName]
        })
          .forge(
            addRelation.map(
              i => ({ id: i, [relationForeignKey]: resource.get('id') })
            ).concat(clearRelation.map(
              i => ({ id: i, [relationForeignKey]: null })
            ))
          );
        await collection.invokeThen('save', null, { transacting });
      }
    }
  });
  return resource;
}
