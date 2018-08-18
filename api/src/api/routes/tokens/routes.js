import Router from 'koa-router';
import JsonApiQueryParserClass from 'jsonapi-query-parser';
import moment from 'moment';

import {
  validate,
  cleanAttributes,
} from '../../validate';
import {
  filterTokenSchemas,
  createTokenSchemas,
} from '../../../schemas/tokens';
import {
  jsonApiCreateSchema,
} from '../../../schemas/common';
import {
  tokens,
  tokensDefaultFields,
} from '../../../models/tokens';
import {
  mapper,
} from '../../../utils/jsonApiMapper';
import {
  saveResource,
} from '../../../utils/saveResource';
import {
  getTradingInfo,
} from '../../trading';
import { appLogger as logger } from '../../../utils/logger';


const JsonApiQueryParser = new JsonApiQueryParserClass();

const router = new Router({
  prefix: '/tokens'
});


async function getTokens({
  ctx,
  data,
  isCollection,
  successStatus,
  returnItems,
  withDeleted,
}) {
  try {
    await validate(filterTokenSchemas, data);
  } catch (errors) {
    ctx.status = 400;
    ctx.body = {
      errors,
    };
    return;
  }
  const filter = data.filter;
  const search = data.search;
  const query = tokens.forge();
  const items = await query.fetchJsonApi({
    withDeleted,
    fields: (data.fields && Object.keys(data.fields).length) ? data.fields : {
      tokens: tokensDefaultFields.fields,
    },
    page: (data.page && Object.keys(data.page).length) ? data.page : {
      limit: isCollection ? 500 : 1,
      offset: 0,
    },
    sort: (data.sort && data.sort.length) ? data.sort : ['-address'],
    include: (data.include && data.include.length) ? data.include : tokensDefaultFields.include,
    filter,
    search,
  });
  if (returnItems) {
    return items;
  }
  const mappedTokens = mapper.map(items, 'tokens');

  const dataWithTradingInfo = await Promise.all(
    mappedTokens.data.map(token =>
      getTradingInfo(token.id).then(tradingInfo => ({
        ...token,
        attributes: {
          ...token.attributes,
          tradingInfo
        }
      }))
    )
  ).catch(() => {
    logger.log('error', 'trading infor error');
  });

  mappedTokens.data = dataWithTradingInfo;

  ctx.status = successStatus;
  if (isCollection) {
    ctx.body = {
      meta: items.pagination,
      ...mappedTokens };
  } else if (!mappedTokens.data[0]) {
    ctx.status = 404;
  } else {
    ctx.body = {
      data: mappedTokens.data[0],
      included: mappedTokens.included,
    };
  }
}

async function saveToken(ctx) {
  const jsonApiSaveSchema = jsonApiCreateSchema;
  const saveSchemas = createTokenSchemas();

  try {
    await validate([jsonApiSaveSchema], ctx.request.body);
  } catch (errors) {
    ctx.status = 400;
    ctx.body = {
      errors,
    };
    return;
  }
  const attributes = cleanAttributes(
    ctx.request.body.data.attributes || {},
    tokensDefaultFields.fields.reduce((p, c) => ({ ...p, [c]: true }), {})
  );
  attributes.created_at = moment().toISOString();
  const relationships = ctx.request.body.data.relationships;

  try {
    await validate(saveSchemas, attributes);
  } catch (errors) {
    ctx.status = 400;
    ctx.body = {
      errors,
    };
    return;
  }

  try {
    const savedToken = await saveResource({
      model: tokens,
      attributes,
      relationships,
      allowedCreateRelationships: [],
      allowedUpdateRelationships: tokensDefaultFields.include,
      options: { method: 'insert' }
    });
    const successStatus = 201;
    await getTokens({
      ctx,
      data: {
        filter: {
          address: savedToken.get('address')
        }
      },
      isCollection: false,
      successStatus,
      returnItems: false,
      withDeleted: false,
    });
  } catch (err) {
    console.log(err);
    ctx.status = 500;
    ctx.body = {
      errorMessage: 'Something wrong',
    };
  }
}

/**
  * @swagger
  * /tokens/filter:
  *   post:
  *     summary: Filter tokens
  *     description: Fetch tokens
  *     tags: [Tokens]
  *     operationId: FilterTokens
  *     consumes:
  *       - application/json
  *     produces:
  *       - application/json
  *     security:
  *       - JWT: []
  *     parameters:
  *       - $ref: '#/parameters/tokens-filter'
  *     responses:
  *       200:
  *         description: Success response
*/
router.post('/filter', async (ctx) => {
  const data = ctx.request.body;
  await getTokens({
    ctx,
    data,
    isCollection: true,
    successStatus: 200,
    returnItems: false,
    withDeleted: data.withDeleted || false,
  });
});
router.get('/', async (ctx) => {
  const data = JsonApiQueryParser.parseRequest(ctx.url).queryData;
  await getTokens({
    ctx,
    data,
    isCollection: true,
    successStatus: 200,
    returnItems: false,
    withDeleted: data.withDeleted || false,
  });
});

/**
  * @swagger
  * /tokens/{tokenAddress}:
  *   get:
  *     summary: Get token by token address
  *     description: Get token by token address
  *     tags: [Tokens]
  *     operationId: GetTokenByAddress
  *     consumes:
  *       - application/json
  *     produces:
  *       - application/json
  *     security:
  *       - JWT: []
  *     parameters:
  *       - name: tokenAddress
  *         in: path
  *         type: string
  *         required: true
  *         example: "0x0"
  *     responses:
  *       200:
  *         description: Success response
  *       404:
  *         description: Not found
*/
router.get('/:address', async (ctx) => {
  await getTokens({
    ctx,
    data: {
      filter: {
        address: ctx.params.address
      }
    },
    isCollection: false,
    successStatus: 200,
    returnItems: false,
    withDeleted: false,
  });
});

/**
  * @swagger
  * /tokens:
  *   post:
  *     summary: Create a new token
  *     description: Create a new token
  *     tags: [Tokens]
  *     operationId: CreateToken
  *     consumes:
  *       - application/json
  *     produces:
  *       - application/json
  *     security:
  *       - JWT: []
  *     parameters:
  *       - $ref: '#/parameters/tokens-create-new'
  *     responses:
  *       201:
  *         description: Resource created
  *       400:
  *         description: Validation error
*/
router.post('/', async (ctx) => {
  await saveToken(ctx);
});

export default router;
