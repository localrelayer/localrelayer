import * as eff from 'redux-saga/effects';
import createActionCreators from 'redux-resource-action-creators';
import api from '../api';

function* fetchMarketQuotes(opts = {}) {
  const { symbols } = opts;
  const actions = createActionCreators('read', {
    resourceType: 'marketQuotes',
    requestKey: 'marketQuotes',
    mergeListIds: true,
  });
  try {
    yield eff.put(actions.pending());
    const marketQuotes = yield eff.call(
      api.getMarketQuotes,
      {
        symbols,
      },
    );
    const records = Object.values(marketQuotes).map(quote => ({
      ...quote,
      id: quote.symbol,
    }));
    yield eff.put(actions.succeeded({
      resources: records,
    }));
  } catch (error) {
    console.log(error);
    yield eff.put(actions.succeeded({
      resources: [],
    }));
  }
}

export function* marketQuotesWatcher(
  {
    delay,
    symbols,
  },
) {
  while (true) {
    yield eff.fork(
      fetchMarketQuotes,
      {
        symbols,
      },
    );
    yield eff.delay(delay);
  }
}
