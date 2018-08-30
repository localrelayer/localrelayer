import {
  api,
  coreMocks,
} from 'instex-core';

import config from 'web-config';

api.setApiUrl(config.apiUrl);
api.setMockMethods({
  getAssetPairs() {
    return new Promise(r => r(coreMocks.getAssetPairs()));
  },
});
