// Load modules
import {
  assign as _assign,
  forEach as _forEach,
  has as _has,
  hasIn as _hasIn,
  includes as _includes,
  isEmpty as _isEmpty,
  isArray as _isArray,
  isObject as _isObject,
  isObjectLike as _isObjectLike,
  isNull as _isNull,
  forIn as _forIn,
  keys as _keys,
  map as _map,
  zipObject as _zipObject
} from 'lodash';

import split from 'split-string';

import inflection from 'inflection';

import Paginator from 'bookshelf-page';

/**
 * Exports a plugin to pass into the bookshelf instance, i.e.:
 *
 *      import config from './knexfile';
 *      import knex from 'knex';
 *      import bookshelf from 'bookshelf';
 *
 *      const Bookshelf = bookshelf(knex(config));
 *
 *      Bookshelf.plugin('bookshelf-jsonapi-params');
 *
 *      export default Bookshelf;
 *
 * The plugin attaches the `fetchJsonApi` instance method to
 * the Bookshelf Model object.
 *
 * See methods below for details.
 */
export default (Bookshelf, options = {}) => {
  // Load the pagination plugin
  Bookshelf.plugin(Paginator);

  /**
   * Similar to {@link Model#fetch} and {@link Model#fetchAll}, but specifically
   * uses parameters defined by the {@link https://jsonapi.org|JSON API spec} to
   * build a query to further refine a result set.
   *
   * @param  opts {object}
   *     Currently supports the `include`, `fields`, `sort`, `page` and `filter`
   *     parameters from the {@link https://jsonapi.org|JSON API spec}.
   * @param  type {string}
   *     An optional string that specifies the type of resource being retrieved.
   *     If not specified, type will default to the name of the table associated
   *     with the model.
   * @return {Promise<Model|Collection|null>}
   */
  const fetchJsonApi = function (fetchJsonApiOptions, isCollection = true, type) {
    const opts = { ...fetchJsonApiOptions };

    const internals = {};
    const {
      include,
      fields,
      sort,
      page = {},
      filter,
      search,
    } = opts;
    const filterTypes = ['eq', 'in', 'notin', 'like', 'ilike', 'ilikes', 'ne', 'lt', 'gt', 'lte', 'gte'];

    // Get a reference to the field being used as the id
    internals.idAttribute = this.constructor.prototype.idAttribute ?
      this.constructor.prototype.idAttribute : 'id';

    // Get a reference to the current model name. Note that if no type is
    // explcitly passed, the tableName will be used
    internals.modelName = type || this.constructor.prototype.tableName;

    // Initialize an instance of the current model and clone the initial query
    internals.model =
      this.constructor.forge().query(qb => _assign(qb, this.query().clone()));

    /**
     * Build a query for relational dependencies of filtering and sorting
     * @param   filterValues {object}
     * @param   searchValues {object}
     * @param   sortValues {object}
     */
    internals.buildDependencies = (filterValues, searchValues, sortValues) => {
      const relationHash = {};
      // Find relations in fitlerValues
      if (_isObjectLike(filterValues) && !_isEmpty(filterValues)) {
        // Loop through each filter value
        _forEach(filterValues, (value, key) => {
          // If the filter is not an equality filter
          internals.buildDependenciesHelper(key, relationHash);
        });
      }

      // Find relations in searchValues
      if (_isObjectLike(searchValues) && !_isEmpty(searchValues)) {
        // Loop through each filter value
        _forEach(searchValues, (value, key) => {
          // If the filter is not an equality filter
          internals.buildDependenciesHelper(key, relationHash);
        });
      }

      // Find relations in sortValues
      if (_isObjectLike(sortValues) && !_isEmpty(sortValues)) {
        // Loop through each sort value
        _forEach(sortValues, (value) => {
          // If the sort value is descending, remove the dash
          if (value.indexOf('-') === 0) {
            value = value.substr(1);
          }
          // Add relations to the relationHash
          internals.buildDependenciesHelper(value, relationHash);
        });
      }

      // Need to select model.* so all of the relations are not returned, also check if there is anything in fields object
      if (_keys(relationHash).length && !_keys(fields).length) {
        internals.model.query((qb) => {
          qb.select(`${internals.modelName}.*`);
        });
      }
      // Recurse on each of the relations in relationHash
      _forIn(relationHash, (value, key) =>
        internals.queryRelations(value, key, this, internals.modelName)
      );
    };

    /**
     * Recursive funtion to add relationships to main query to allow filtering and sorting
     * on relationships by using left outer joins
     * @param   relation {object}
     * @param   relationKey {string}
     * @param   parent {object}
     * @param   parentKey {string}
     */
    internals.queryRelations = (relation, relationKey, parentModel, parentKey) => {
      // Add left outer joins for the relation
      const relatedData = parentModel[relationKey]().relatedData;

      internals.model.query((qb) => {
        const foreignKey = relatedData.foreignKey ? relatedData.foreignKey : `${inflection.singularize(relatedData.parentTableName)}_${relatedData.parentIdAttribute}`;
        if (relatedData.type === 'hasOne' || relatedData.type === 'hasMany') {
          qb.leftOuterJoin(`${relatedData.targetTableName} as ${relationKey}`,
            `${parentKey}.${relatedData.parentIdAttribute}`,
            `${relationKey}.${foreignKey}`);
        } else if (relatedData.type === 'belongsTo') {
          qb.leftOuterJoin(`${relatedData.targetTableName} as ${relationKey}`, `${parentKey}.${foreignKey}`, `${relationKey}.${relatedData.targetIdAttribute}`);
        } else if (relatedData.type === 'belongsToMany') {
          const otherKey = relatedData.otherKey ? relatedData.otherKey : `${inflection.singularize(relatedData.targetTableName)}_id`;
          const joinTableName = relatedData.joinTableName ? relatedData.joinTableName : relatedData.throughTableName;

          qb.leftOuterJoin(`${joinTableName} as ${relationKey}_${joinTableName}`,
            `${parentKey}.${relatedData.parentIdAttribute}`,
            `${relationKey}_${joinTableName}.${foreignKey}`);
          qb.leftOuterJoin(`${relatedData.targetTableName} as ${relationKey}`,
            `${relationKey}_${joinTableName}.${otherKey}`,
            `${relationKey}.${relatedData.targetIdAttribute}`);
        } else if (_includes(relatedData.type, 'morph')) {
          // Get the morph type and id
          const morphType = relatedData.columnNames[0] ? relatedData.columnNames[0] : `${relatedData.morphName}_type`;
          const morphId = relatedData.columnNames[1] ? relatedData.columnNames[0] : `${relatedData.morphName}_id`;
          if (relatedData.type === 'morphOne' || relatedData.type === 'morphMany') {

            qb.leftOuterJoin(`${relatedData.targetTableName} as ${relationKey}`, (qbJoin) => {
              qbJoin.on(`${relationKey}.${morphId}`, '=', `${parentKey}.${relatedData.parentIdAttribute}`);
            }).where(`${relationKey}.${morphType}`, '=', relatedData.morphValue);
          } else if (relatedData.type === 'morphTo') {
            // Not implemented
          }
        }
      });

      if (!_keys(relation).length) {
        return;
      }
      _forIn(relation, (value, key) => {
        return internals.queryRelations(value, key, parentModel[relationKey]().relatedData.target.forge(), relationKey);
      });
    };

    /**
     * Adds relations included in the key to the relationHash, used in buildDependencies
     * @param   key {string}
     * @param   relationHash {object}
     */
    internals.buildDependenciesHelper = (key, relationHash) => {

      if (_includes(key, '.')) {
        // The last item in the chain is a column name, not a table. Do not include column name in relationHash
        key = key.substring(0, key.lastIndexOf('.'));
        if (!_has(relationHash, key)) {
          let level = relationHash;
          const relations = key.split('.');
          let relationModel = this.clone();

          // Traverse the relationHash object and set new relation if it does not exist
          _forEach(relations, (relation) => {

            // Check if valid relationship
            if (typeof relationModel[relation] === 'function' && relationModel[relation]().relatedData.type) {
              if (!level[relation]) {
                level[relation] = {};
              }
              level = level[relation];

              // Set relation model to the next item in the chain
              relationModel = relationModel.related(relation).relatedData.target.forge();
            } else {
              return false;
            }
          });
        }
      }
    };

    /**
     * Build a query based on the `fields` parameter.
     * @param  fieldNames {object}
     */
    internals.buildFields = (fieldNames = {}) => {

      if (_isObject(fieldNames) && !_isEmpty(fieldNames)) {

        // Format column names
        fieldNames = internals.formatColumnNames(fieldNames);

        // Process fields for each type/relation
        _forEach(fieldNames, (fieldValue, fieldKey) => {

          // Add qualifying table name to avoid ambiguous columns
          fieldNames[fieldKey] = _map(fieldNames[fieldKey], (value) => {

            if (!fieldKey) {
              if (_includes(value, '.')) {
                return value;
              }
              return `${internals.modelName}.${value}`;
            }
            return `${fieldKey}.${value}`;
          });

          // Only process the field if it's not a relation. Fields
          // for relations are processed in `buildIncludes()`
          if (!_includes(include, fieldKey)) {


            // Add columns to query
            internals.model.query((qb) => {

              if (!fieldKey) {
                qb.distinct();
              }

              qb.select(fieldNames[fieldKey]);

              // JSON API considers relationships as fields, so we
              // need to make sure the id of the relation is selected
              _forEach(include, (relation) => {

                if (internals.isBelongsToRelation(relation, this)) {
                  const relatedData = this.related(relation).relatedData;
                  const relationId = relatedData.foreignKey ? relatedData.foreignKey : `${inflection.singularize(relatedData.parentTableName)}_${relatedData.parentIdAttribute}`;
                  qb.select(`${internals.modelName}.${relationId}`);
                }
              });
            });
          }
        });


      }
    };

    /**
     * Build a query based on the `filters` parameter.
     * @param  filterValues {object|array}
     */
    internals.buildFilters = (qb, filterValues, wherePrefix, filtersEmpty) => {
      if (_isObjectLike(filterValues) && !_isEmpty(filterValues)) {
        // build the filter query
          let index = 0;
          _forEach(filterValues, (value, key) => {
            let whereMethod = wherePrefix;
            if (whereMethod === 'orWhere' && filtersEmpty && !index) {
              whereMethod = 'where';
            }
            index += 1;
            // If the value is a filter type
            if (_isObjectLike(value)) {
              // Format column names of filter types
              const filterTypeValues = value;
              // Loop through each value for the valid filter type
              _forEach(filterTypeValues, (typeValue, typeKey) => {
                if (_includes(filterTypes, typeKey)) {
                  const operatorName = typeKey;
                  const fieldName = internals.formatRelation(internals.formatColumnNames([key])[0]);
                  const fieldValue = typeValue;
                  // Remove all but the last table name, need to get number of dots

                  // Attach different query for each type
                  if (operatorName === 'like') {
                    // Need to add double quotes for each table/column name, this is needed if there is a relationship with a capital letter
                    const formatedFieldName = `"${fieldName.replace('.', '"."')}"`;
                    qb[whereMethod](
                      Bookshelf.knex.raw(`LOWER(${formatedFieldName}) like LOWER(?)`, [`%${typeValue}%`])
                    );
                  } else if (operatorName === 'ilike') {
                    // Need to add double quotes for each table/column name, this is needed if there is a relationship with a capital letter
                    const formatedFieldName = `"${fieldName.replace('.', '"."')}"`;
                    qb[whereMethod](
                      Bookshelf.knex.raw(`LOWER(${formatedFieldName}) ILIKE LOWER(?)`, [`%${typeValue}%`])
                    );
                  } else if (operatorName === 'ilikes') {
                    // Need to add double quotes for each table/column name, this is needed if there is a relationship with a capital letter
                    const formatedFieldName = `"${fieldName.replace('.', '"."')}"`;
                    qb[whereMethod](
                      Bookshelf.knex.raw(`LOWER(${formatedFieldName}) ILIKE LOWER(?)`, [`${typeValue}`])
                    );

                  } else if (operatorName === 'eq') {
                    if (fieldValue) {
                      qb[whereMethod](fieldName, '=', fieldValue);
                    } else {
                      qb[whereMethod](fieldName, fieldValue);
                    }
                  } else if (operatorName === 'in') {
                    qb[`${whereMethod}In`](fieldName, fieldValue);
                  } else if (operatorName === 'ne') {
                    qb[`${whereMethod}Not`](fieldName, fieldValue);
                  } else if (operatorName === 'notin') {
                    qb[`${whereMethod}NotIn`](fieldName, fieldValue);
                  } else if (operatorName === 'lt') {
                    qb[whereMethod](fieldName, '<', fieldValue);
                  } else if (operatorName === 'gt') {
                    qb[whereMethod](fieldName, '>', fieldValue);
                  } else if (operatorName === 'lte') {
                    qb[whereMethod](fieldName, '<=', fieldValue);
                  } else if (operatorName === 'gte') {
                    qb[whereMethod](fieldName, '>=', fieldValue);
                  }
                }});
              // If the value is an equality filter
            } else {
              // Remove all but the last table name, need to get number of dots
              key = internals.formatRelation(internals.formatColumnNames([key])[0]);

              qb[whereMethod](key, value);
            }
          });
      }
    };

    /**
     * Takes in an attribute string like a.b.c.d and returns c.d, also if attribute
     * looks like 'a', it will return tableName.a where tableName is the top layer table name
     * @param   attribute {string}
     * @return  {string}
     */
    internals.formatRelation = (attribute) => {

      if (_includes(attribute, '.')) {
        const splitKey = attribute.split('.');
        attribute = `${splitKey[splitKey.length - 2]}.${splitKey[splitKey.length - 1]}`;
      }
      // Add table name to before column name if no relation to avoid ambiguous columns
      else {
        attribute = `${internals.modelName}.${attribute}`;
      }
      return attribute;
    };

    /**
     * Takes an array from attributes and returns the only the columns and removes the table names
     * @param   attributes {array}
     * @return  {array}
     */
    internals.getColumnNames = (attributes) => {

      return _map(attributes, (attribute) => {

        return attribute.substr(attribute.lastIndexOf('.') + 1);
      });
    };

    /**
     * Build a query based on the `include` parameter.
     * @param  includeValues {array}
     */
    internals.buildIncludes = (includeValues) => {

      if (_isArray(includeValues) && !_isEmpty(includeValues)) {

        const relations = [];

        _forEach(includeValues, (relation) => {

          if (_has(fields, relation)) {

            const fieldNames = internals.formatColumnNames(fields);

            relations.push({
              [relation]: (qb) => {

                if (!internals.isBelongsToRelation(relation, this)) {
                  const relatedData = this[relation]().relatedData;
                  const foreignKey = relatedData.foreignKey ? relatedData.foreignKey : `${inflection.singularize(relatedData.parentTableName)}_${relatedData.parentIdAttribute}`;

                  if (!_includes(fieldNames[relation], foreignKey)) {
                    qb.column.apply(qb, [foreignKey]);
                  }
                }
                fieldNames[relation] = internals.getColumnNames(fieldNames[relation]);
                if (!_includes(fieldNames[relation], 'id')) {
                  qb.column.apply(qb, ['id']);
                }
                qb.column.apply(qb, [fieldNames[relation]]);
              }
            });
          } else {
            relations.push(relation);
          }
        });

        // Assign the relations to the options passed to fetch/All
        _assign(opts, {
          withRelated: relations
        });
      }
    };

    /**
     * Build a query based on the `sort` parameter.
     * @param  sortValues {array}
     */
    internals.buildSort = (sortValues = []) => {


      if (_isArray(sortValues) && !_isEmpty(sortValues)) {

        let sortDesc = [];

        for (let i = 0; i < sortValues.length; ++i) {

          // Determine if the sort should be descending
          if (typeof sortValues[i] === 'string' && sortValues[i][0] === '-') {
            sortValues[i] = sortValues[i].substring(1);
            sortDesc.push(sortValues[i]);
          }
        }

        // Format column names according to Model settings
        sortDesc = internals.formatColumnNames(sortDesc);
        sortValues = internals.formatColumnNames(sortValues);

        _forEach(sortValues, (sortBy) => {

          internals.model.orderBy(sortBy, sortDesc.indexOf(sortBy) === -1 ? 'asc' : 'desc');
        });
      }
    };

    /**
     * Processes incoming parameters that represent columns names and
     * formats them using the internal {@link Model#format} function.
     * @param  columnNames {array}
     * @return {array{}
     */
    internals.formatColumnNames = (columnNames = []) => {

      _forEach(columnNames, (value, key) => {

        let columns = {};
        if (_includes(value, '.')) {
          columns[columnNames[key].substr(columnNames[key].lastIndexOf('.') + 1)] = undefined;
          columnNames[key] = columnNames[key].substring(0, columnNames[key].lastIndexOf('.')) + '.' + _keys(this.format(columns));
        } else if (_isArray(value) && key === '' && value.length === 1 && _includes(value[0], '.')) {
          columns[value[0].substr(value[0].lastIndexOf('.') + 1)] = undefined;
          value[0] = value[0].substring(0, value[0].lastIndexOf('.')) + '.' + _keys(this.format(columns));
        } else {
          // Convert column names to an object so it can
          // be passed to Model#format
          if (_isArray(columnNames[key])) {
            columns = _zipObject(columnNames[key], null);
          } else {
            columns = _zipObject(columnNames, null);
          }

          // Format column names using Model#format
          if (_isArray(columnNames[key])) {
            columnNames[key] = _keys(this.format(columns));
          } else {
            columnNames = _keys(this.format(columns));
          }
        }
      });

      return columnNames;
    };

    /**
     * Determines if the specified relation is a `belongsTo` type.
     * @param   relationName {string}
     * @param   model {object}
     * @return  {boolean}
     */
    internals.isBelongsToRelation = (relationName, model) => {

      if (!model.related(relationName)) {
        return false;
      }
      const relationType = model.related(relationName).relatedData.type.toLowerCase();

      if (relationType !== undefined &&
        relationType === 'belongsto') {

        return true;
      }

      return false;
    };

    /**
     * Determines if the specified relation is a `many` type.
     * @param   relationName {string}
     * @param   model {object}
     * @return  {boolean}
     */
    internals.isManyRelation = (relationName, model) => {

      if (!model.related(relationName)) {
        return false;
      }
      const relationType = model.related(relationName).relatedData.type.toLowerCase();

      if (relationType !== undefined &&
        relationType.indexOf('many') > 0) {

        return true;
      }

      return false;
    };

    /**
     * Determines if the specified relation is a `hasone` type.
     * @param   relationName {string}
     * @param   model {object}
     * @return  {boolean}
     */
    internals.ishasOneRelation = (relationName, model) => {
      if (!model.related(relationName)) {
        return false;
      }
      const relationType = model.related(relationName).relatedData.type.toLowerCase();

      if (relationType !== undefined &&
        relationType === 'hasone') {
        return true;
      }

      return false;
    };

    // //////////////////////////////
    // / Process parameters
    // //////////////////////////////

    // Apply relational dependencies for filters and sorting
    internals.buildDependencies(filter, search, sort);

    internals.model.query((qb) => {
      // Apply filters
      internals.buildFilters(qb, filter, 'where');

      // Apply search
      qb.where(function() {
        internals.buildFilters(this, search, 'orWhere', _isEmpty(filter));
      })

      // Apply sorting
      internals.buildSort(sort);

      // Apply relations
      internals.buildIncludes(include);

      // Apply sparse fieldsets
      internals.buildFields(fields);
    });

    // Assign default paging options if they were passed to the plugin
    // and no pagination parameters were passed directly to the method.
    if (isCollection &&
      _isEmpty(page) &&
      _has(options, 'pagination')) {
      _assign(page, options.pagination);
    }

    // Apply paging
    if (isCollection && _isObject(page) && !_isEmpty(page)) {
      const pageOptions = _assign(opts, page);
      return internals.model.fetchPage(pageOptions);
    }

    // Determine whether to return a Collection or Model

    // Call `fetchAll` to return Collection
    if (isCollection) {
      return internals.model.fetchAll(opts);
    }

    // Otherwise, call `fetch` to return Model
    return internals.model.fetch(opts);
  };

  // Add `fetchJsonApi()` method to Bookshelf Model/Collection prototypes
  Bookshelf.Model.prototype.fetchJsonApi = fetchJsonApi;

  Bookshelf.Model.fetchJsonApi = function (...args) {
    return this.forge().fetchJsonApi(...args);
  };

  Bookshelf.Collection.prototype.fetchJsonApi = function (...args) {
    return fetchJsonApi.apply(this.model.forge(), ...args);
  };
};
