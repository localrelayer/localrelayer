export async function getUser({ email, companyName, companyId, Companies, Users }) {
  const user =
    companyId ?
      await Users.findOne({
        where: { email, companyId }
      }) :
      await Users.findOne({
        where: { email },
        include: [{
          model: Companies,
          where: { name: companyName }
        }]
      });

  if (!user) {
    return null;
  }
  return user;
}

export async function setDbRecord({
  data,
  action,
  model,
  transaction,
  updateWhere,
  additionalRunMethods,
  include,
}) {
  const saveData = { ...data };
  const checkNewInclude = include ? include.filter(i => i.checkNew) : [];
  const checkExistInclude = include ? include.filter(i => i.checkExist) : [];
  const includeModels = checkNewInclude.map(i => i.model);

  if (action === 'create') {
    checkNewInclude.forEach((inc) => {
      const includeData = data[inc.dataKey];
      const newData = includeData ? includeData.filter(i => !i.id) : [];
      if (newData.length) {
        saveData[inc.dataKey] = newData;
      }
    });
  }
  let dbObj = null;
  if (action === 'create') {
    dbObj = await model.create(
      saveData,
      {
        include: includeModels,
        returning: true,
        transaction,
      }
    );
  } else {
    dbObj = await model.update(
      saveData,
      {
        where: updateWhere,
        include: includeModels,
        returning: true,
        transaction,
      },
    );
    dbObj = dbObj[1][0];
  }
  const updateMethodArgs = {};
  for (const eInclude of checkExistInclude) {
    const includeData = data[eInclude.dataKey];
    const eData = includeData ? includeData.filter(i => i.id).map(i => i.id) : [];
    if (eData.length) {
      const existObjects = await eInclude.model.findAll({
        where: {
          id: { $in: eData }
        },
      }, { transaction });
      updateMethodArgs[eInclude.dataKey] = existObjects;
      if (existObjects) {
        await dbObj[eInclude.updateMethod](existObjects, { transaction });
      }
    }
  }
  if (additionalRunMethods) {
    for (const method of additionalRunMethods) {
      await dbObj[method.methodName](method.args, { transaction });
    }
  }
  if (action === 'update') {
    for (const method of checkNewInclude) {
      const initArgs = saveData[method.dataKey];
      if (initArgs) {
        const args = initArgs.filter(i => !i.id);
        let updateArgs = updateMethodArgs[method.dataKey] || [];
        if (!initArgs.length) {
          await dbObj[method.updateMethod](updateArgs, { transaction });
        } else if (args.length) {
          const newObjs = await method.model[method.createIncludeModelMethod](
            args, { returning: true, transaction }
          );
          updateArgs = updateArgs.concat(newObjs);
          await dbObj[method.updateMethod](updateArgs, { transaction });
        }
      }
    }
  }

  const plainDbObj = dbObj.get({ plain: true });
  return [plainDbObj, dbObj];
}

const normalizeInclude = ({ data, include }) =>
  include
    .map(
      (iSchema) => {
        let includeItem = data.find(i => i.model === iSchema.modelName);
        if (!includeItem && !iSchema.required) {
          return false;
        }
        if (!includeItem && iSchema.required) {
          includeItem = {
            required: true,
            where: {},
          };
        }
        let whereItem = includeItem.where || {};
        if (iSchema.where) {
          whereItem = { ...whereItem, ...iSchema.where };
        }
        const includeData = includeItem.include || [];
        return {
          ...includeItem,
          model: iSchema.model,
          attributes: iSchema.attributes,
          include: iSchema.include ?
            normalizeInclude({ data: includeData, include: iSchema.include }) :
            [],
          through: iSchema.through || null,
          where: whereItem,
        };
      }
    )
    .filter(i => i !== false);

export function normalizeFilterData({ data, include, where }) {
  const normalizedData = {
    include: data.include || [],
    where: data.where || {},
  };

  if (where) {
    normalizedData.where = {
      ...normalizedData.where,
      ...where,
    };
  }

  normalizedData.include = normalizeInclude({ data: normalizedData.include, include });
  return {
    limit: data.limit || 1,
    offset: data.offset || 0,
    where: normalizedData.where,
    include: normalizedData.include,
    order: data.order || [],
  };
}

export const commonExcludeAttributes = ['createdAt', 'updatedAt', 'deletedAt', 'companyId'];
