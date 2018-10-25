import {
  runGanacheServer,
} from '../ganacheServer';
import {
  subscribeEthEvents,
} from './subscribe';
import {
  runFillQueueHandler,
  runEthEventHandler,
} from './eventHandlers';


function runSputnik() {
  runEthEventHandler();
  runFillQueueHandler();
  subscribeEthEvents([
    ...(process.env.NODE_ENV === 'development' ? ['test'] : []),
    // 'main',
    // 'kovan',
  ]);
}

if (process.env.RUN_GANACHE === 'true') {
  runGanacheServer(runSputnik);
} else {
  runSputnik();
}
