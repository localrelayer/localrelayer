import _ from 'lodash';
import v from 'validate.js';
import bcrypt from 'bcrypt';


v.validators.checkDbRecordExists = async function (
  value,
  {
    model,
    fieldName,
    reverse,
    query,
    message,
  }, key, data
) {
  if (value) {
    const queries = [{
      where: { [fieldName]: value }
    }];
    if (query) {
      queries.push(qb => query(qb, data));
    }
    /*
    if (additionalWhere) {
      additionalWhere.forEach((w) => {
        where[w.field] = w.condition;
      });
    }
    if (additionalWhereFromCurrentData) {
      additionalWhereFromCurrentData.forEach((w) => {
        where[w.field] = {
          [w.opertor]: data[w.dataField],
        };
      });
    }
    */
    const dbRecord = await queries.reduce((p, c) => p.query(c), model.forge()).fetch();
    if (reverse ? dbRecord : !dbRecord) {
      return message;
    }
  }
};

v.validators.validateEachItem = async function (
  value,
  {
    validateSchema
  },
) {
  if (value) {
    for (const validateItem of value) {
      try {
        await validate([validateSchema], validateItem);
      } catch (errors) {
        return errors;
      }
    }
  }
};

v.validators.isArray = function (value, { message }) {
  if (value && !v.isArray(value)) {
    return message;
  }
};

v.validators.isInteger = function (value, { message }) {
  if (value !== undefined && value !== null && !v.isInteger(value)) {
    return message;
  }
};

const maxInt = (value, { message, number }) => {
  if (v.isInteger(value) && (value > number)) {
    return message;
  }
};

const minInt = (value, { message, number }) => {
  if (v.isInteger(value) && (value < number)) {
    return message;
  }
};

v.validators.maxInt = maxInt;
v.validators.minInt = minInt;

const checkArray = (value, { message, exclude, allowed }) => {
  if (value && v.isArray(value) && value.length) {
    const checkAllowed = allowed && allowed.length;
    const checkExclude = exclude && exclude.length;
    if (checkAllowed && !value.some(el => allowed.includes(el))) {
      return message;
    }
    if (checkExclude && value.some(el => exclude.includes(el))) {
      return message;
    }
  }
};

v.validators.checkArray = checkArray;

v.validators.checkFields = function (value, { fieldTypes }) {
  if (value) {
    for (const fieldType of Object.keys(fieldTypes)) {
      const error = checkArray(value[fieldType], fieldTypes);
      if (error) {
        return error;
      }
    }
  }
};

v.validators.checkPage = function (value, { message, minLimit, maxLimit }) {
  if (value) {
    const maxError = maxInt(value.limit, { message, number: maxLimit });
    if (maxError) {
      return maxError;
    }
    const minError = minInt(value.limit, { message, number: minLimit });
    if (minError) {
      return minError;
    }
  }
};

v.validators.filterScopes = function (scopes, { message, exclude, allowed }) {
  if (scopes && v.isArray(scopes)) {
    for (const scope of scopes) {
      const scopeName = v.isString(scope) ? scope : scope.method;
      if (allowed) {
        const res = allowed.some((r) => {
          if (v.isString(r)) {
            return r === scopeName;
          }
          const isAllow = r.method === scopeName;
          if (isAllow && r.allowedArgs) {
            return r.allowedArgs.includes(scope.arg);
          }
          if (isAllow && r.excludeArgs) {
            return !r.excludeArgs.includes(scope.arg);
          }
          return isAllow;
        });
        if (!res) {
          return message;
        }
      }
      if (exclude) {
        const res = exclude.some((r) => {
          if (v.isString(r)) {
            return r === scopeName;
          }
          const isExclude = r.method === scopeName;
          return isExclude;
        });
        if (res) {
          return message;
        }
      }
    }
  }
};

v.validators.filterWhereQuery = function (value, { message, exclude, allowed }) {
  const checkAllowed = allowed && allowed.length;
  const checkExclude = exclude && exclude.length;
  let where = value;

  if (where) {
    if (where.$and) {
      where = _.omit({
        ...where.$and,
        ...where.$or
      }, '$and');
    }
    if (where.$or) {
      where = _.omit({
        ...where.$and,
        ...where.$or
      }, '$or');
    }
    const res = Object.keys(where).some((key) => {
      if (checkAllowed && !allowed.includes(key)) {
        return false;
      }
      if (checkExclude && exclude.includes(key)) {
        return false;
      }
      return true;
    });
    if (!res) {
      return message;
    }
  }
};

v.validators.filterInclude = function (include, { message, models }) {
  if (include) {
    for (const query of include) { // eslint-disable-line
      if (!models[query.model]) {
        return message;
      }
      const allowed = models[query.model].allowed;
      const exclude = models[query.model].exclude;

      if (query.where && (allowed || exclude)) {
        const error = v.validators.filterWhereQuery(
          query.where,
          {
            allowed,
            exclude,
            message: models[query.model].message,
          }
        );
        if (error) {
          return error;
        }
      }
    }
  }
};

v.validators.checkUserPassword =
  async function (email, {
    users,
    passwordKey,
    message,
  }, key, data) {
    const password = data[passwordKey];
    const user = await users.where({ email }).fetch();
    if (!user) {
      return message;
    }
    if (!bcrypt.compareSync(password, user.get('password'))) {
      return message;
    }
  };

export async function validate(chain, data) {
  for (const schema of chain) { // eslint-disable-line
    if (schema.async) {
      await v.async(data, schema, { fullMessages: false }); // eslint-disable-line
    } else {
      const syncError = v(data, schema, { fullMessages: false });
      if (syncError) {
        throw syncError;
      }
    }
  }
}

export function cleanAttributes(...args) {
  return v.cleanAttributes(...args);
}
