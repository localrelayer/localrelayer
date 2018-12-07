import '../aliases';
import {
  subscribeEthEvents,
} from './subscribe';


function runSputnik() {
  subscribeEthEvents(
    (process.env.ETH_NETWORKS || 'main,kovan,test').split(','),
  );
}

if (require.main === module) {
  runSputnik();
}
