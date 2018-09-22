import {
  createMemoryHistory,
  createBrowserHistory,
} from 'history';

const historyCreators = {
  memory: createMemoryHistory,
  browser: createBrowserHistory,
};
let createdHistory;

export function getHistory(
  historyType = 'memory',
  createHistoryOpts,
) {
  if (createdHistory) {
    return createdHistory;
  }
  createdHistory = historyCreators[historyType](createHistoryOpts);
  return getHistory(historyType, createHistoryOpts);
}
