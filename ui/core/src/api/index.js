import fetch from './enhancedFetch';


function apiFactory() {
  // GET methods with query parameters only
  const apiCommonMethods = [
    ['getAssetPairs', '/v2/asset_pairs'],
    ['getOrders', '/v2/orders'],
    ['getOrderBook', '/v2/orderbook'],
    ['getOrderConfig', '/v2/order-config'],
    ['getTradingHistory', '/sputnik/tradingHistory'],
    ['getBars', '/sputnik/bars'],
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
    const url = new URL(`${apiUrl}${baseUrl}`);
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
        endpointUrl: '/v2/order',
        method: 'POST',
        methodName: 'postOrder',
        bodyParameters,
        queryParameters,
      });
    },

    postOrderConfig(
      bodyParameters,
      queryParameters = {},
    ) {
      return performFetch({
        endpointUrl: '/v2/order_config',
        method: 'POST',
        methodName: 'postOrderConfig',
        bodyParameters,
        queryParameters,
      });
    },

    getTradingInfo(
      bodyParameters,
      queryParameters = {},
    ) {
      return performFetch({
        endpointUrl: '/sputnik/tradingInfo',
        method: 'POST',
        methodName: 'getTradingInfo',
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
