import {
  runGanacheServer,
} from './ganacheServer';
import {
  subscribeExchangeEvents,
} from './subscribe';


function runSputnik() {
  subscribeExchangeEvents([
    ...(process.env.NODE_ENV === 'development' ? ['test'] : []),
    'main',
    'kovan',
  ]);
}

if (process.env.RUN_GANACHE === 'true') {
  runGanacheServer(runSputnik);
} else {
  runSputnik();
}
