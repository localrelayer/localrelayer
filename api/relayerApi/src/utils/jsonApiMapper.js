import config from '../config';

const Mapper = require('jsonapi-mapper');

const jsonapiMapper = new Mapper.Bookshelf(config.apiUrl);
export const mapper = {
  ...jsonapiMapper,
  map: (...args) => ({
    included: [],
    ...jsonapiMapper.map(...args),
  })
};
