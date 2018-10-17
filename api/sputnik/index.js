import {
  runGanacheServer,
} from '../ganacheServer';
import {
  subscribeExchangeEvents,
} from './subscribe';
import {
  runFillQueueHandler,
} from './eventHandlers';


function runSputnik() {
  runFillQueueHandler();
  subscribeExchangeEvents([
    ...(process.env.NODE_ENV === 'development' ? ['test'] : []),
    /*
    'main',
    'kovan',
    */
  ]);
}

if (process.env.RUN_GANACHE === 'true') {
  runGanacheServer(runSputnik);
} else {
  runSputnik();
}
