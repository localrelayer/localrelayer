const useProdApi = true;

module.exports = {
  apiUrl: (
    useProdApi
      ? 'https://api.instex.io'
      : 'http://localhost:5001'
  ),
  socketUrl: (
    useProdApi
      ? 'wss://api.instex.io:8082'
      : 'ws://localhost:5003'
  ),
  mockApi: false,
  useSentry: true,
};
