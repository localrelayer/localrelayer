import fetch from './enhancedFetch';


function apiFactory() {
  // GET methods with query parameters only
  const apiCommonMethods = [
    ['getAssetPairs', '/asset_pairs'],
    ['getOrders', '/orders'],
    ['getOrderBook', '/orderbook'],
    ['getOrderConfig', '/order-config'],
  ];
  let apiUrl = '';
  let mockMethods = {};

  function buildQueryUrl(
    baseUrl,
    queryParameters = {},
  ) {
    if (!apiUrl) {
      throw new Error('No apiUrl!');
    }
    const url = new URL(`${apiUrl}/${baseUrl}`);
    url.search = new URLSearchParams(queryParameters);
    return url;
  }

  function performFetch({
    endpointUrl,
    method,
    methodName,
    queryParameters,
    bodyParameters,
  }) {
    const url = buildQueryUrl(
      endpointUrl,
      queryParameters,
    );

    if (mockMethods[methodName]) {
      return mockMethods[methodName]({
        url,
        endpointUrl,
        queryParameters,
        bodyParameters,
      });
    }

    return fetch(
      url,
      {
        method,
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        ...(bodyParameters ? {
          body: JSON.stringify(bodyParameters),
        } : {}),
      },
    );
  }

  return ({
    getApiUrl() {
      return apiUrl;
    },

    setApiUrl(url) {
      apiUrl = url;
      return apiUrl;
    },

    setMockMethods(
      mockObject,
      merge = true,
    ) {
      if (merge) {
        mockMethods = {
          ...mockMethods,
          ...mockObject,
        };
      } else {
        mockMethods = mockObject;
      }
    },

    clearMockMethods() {
      mockMethods = {};
      return mockMethods;
    },

    getOrder(
      orderHash,
      queryParameters = {},
    ) {
      return performFetch({
        endpointUrl: `/order/${orderHash}`,
        method: 'GET',
        methodName: 'getOrder',
        queryParameters,
      });
    },

    postOrder(
      bodyParameters,
      queryParameters = {},
    ) {
      return performFetch({
        endpointUrl: '/order',
        method: 'POST',
        methodName: 'postOrder',
        bodyParameters,
        queryParameters,
      });
    },

    ...(apiCommonMethods.reduce((
      acc,
      [
        methodName,
        endpointUrl,
      ],
    ) => ({
      ...acc,
      [methodName](queryParameters) {
        return performFetch({
          method: 'GET',
          methodName,
          endpointUrl,
          queryParameters,
        });
      },
    }), {})),
  });
}

const api = apiFactory();

export default api;
