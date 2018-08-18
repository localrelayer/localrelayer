export const filterSchema = {
  page: {
    presence: false,
    checkPage: {
      minLimit: 1,
      maxLimit: 1000,
      message: 'Min limit 1 and Max limit 500',
    },
  },
  sort: {
    presence: false,
    isArray: {
      message: 'Should be array',
    },
  },
  include: {
    presence: false,
    isArray: {
      message: 'Should be array',
    },
  },
};

export const jsonApiCreateSchema = {
  data: {
    presence: {
      message: 'Wrong request, read http://jsonapi.org/format/#crud-creating',
    },
  },
  'data.type': {
    presence: {
      message: 'Wrong request, read http://jsonapi.org/format/#crud-creating',
    },
  }
};

export const jsonApiUpdateSchema = {
  data: {
    presence: {
      message: 'Wrong request, read http://jsonapi.org/format/#crud-creating',
    },
  },
  'data.type': {
    presence: {
      message: 'Wrong request, read http://jsonapi.org/format/#crud-creating',
    },
  },
  'data.id': {
    presence: {
      message: 'Wrong request, read http://jsonapi.org/format/#crud-creating',
    },
  }
};
