import { should } from 'chai';

import {
  pgKnex as knex,
  pgBookshelf as pg,
} from '../../src/db';
import { saveResource } from '../../src/utils/saveResource';


describe('saveResource', () => {
  const tPg = pg.plugin('registry');

  const mainTable = tPg.model('mainTable', {
    tableName: 'mainTable',
    relationOne() {
      return this.belongsTo('relationOne', 'relationOne_id');
    },
    relationMany() {
      return this.belongsToMany('relationMany', 'mainTable_relationMany');
    },
    relationHasMany() {
      return this.hasMany('relationHasMany', 'mainTable_id');
    }
  });

  const relationOne = tPg.model('relationOne', {
    tableName: 'relationOne',
  });

  const relationMany = tPg.model('relationMany', {
    tableName: 'relationMany',
    mainTables() {
      return this.belongsToMany('mainTable', 'mainTable_relationMany');
    }
  });

  const relationHasMany = tPg.model('relationHasMany', {
    tableName: 'relationHasMany',
  });

  const allModels = {
    mainTable,
    relationOne,
    relationMany,
    relationHasMany,
  };


  before(() =>
    knex.schema.dropTableIfExists('mainTable_relationMany')
      .dropTableIfExists('relationMany')
      .dropTableIfExists('relationHasMany')
      .dropTableIfExists('mainTable')
      .dropTableIfExists('relationOne')
      .createTableIfNotExists('relationOne', (table) => {
        table.increments('id').primary();
        table.string('name');
      })
      .createTableIfNotExists('mainTable', (table) => {
        table.increments('id').primary();
        table.integer('relationOne_id').references('relationOne.id');
        table.string('attribute1');
        table.string('attribute2');
        table.string('attribute3');
      })
      .createTableIfNotExists('relationMany', (table) => {
        table.increments('id').primary();
        table.string('name');
      })
      .createTableIfNotExists('mainTable_relationMany', (table) => {
        table.integer('relationMany_id').references('relationMany.id');
        table.integer('mainTable_id').references('mainTable.id');
      })
      .createTableIfNotExists('relationHasMany', (table) => {
        table.increments('id').primary();
        table.string('name');
        table.integer('mainTable_id').references('mainTable.id');
      })
      .then(() =>
        Promise.all([
          relationOne.forge({
            name: 'test',
          }).save(),
          mainTable.forge({
            relationOne_id: 1,
            attribute1: 'test',
            attribute2: 'test',
            attribute3: 'test',
          }).save().then(
            () => relationHasMany.forge({
              mainTable_id: 1,
              name: 'test',
            }).save()
          ),
          relationMany.forge({ name: 'test' }).save(),
        ])
      )
  );

  it('simple', () =>
    saveResource({
      model: mainTable,
      allModels,
      attributes: {
        attribute1: 'test',
        attribute2: 'test',
        attribute3: 'test',
      },
      relationships: {
        relationOne: {
          data: {
            type: 'relationOne',
            id: 1
          },
        },
        relationMany: {
          data: [{
            type: 'relationMany',
            id: 1,
          }, {
            type: 'relationMany',
            attributes: {
              name: 'test2'
            }
          }]
        },
        relationHasMany: {
          data: [{
            type: 'relationHasMany',
            id: 1,
          }, {
            type: 'relationHasMany',
            attributes: {
              name: 'test2'
            }
          }]
        }
      },
      allowedCreateRelationships: ['relationMany', 'relationHasMany'],
      allowedUpdateRelationships: ['relationOne', 'relationMany', 'relationHasMany'],
    }).then((data) => {
      should(data).equal(undefined);
    }).catch((err) => {
      if (err) throw err;
    })
  );
  // TODO: Add more tests
});
