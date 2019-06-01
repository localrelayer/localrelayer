import '../../aliases';
import {
  Order,
} from 'db';

(async () => {
  await Order.updateMany({
    makerAddress: {
      $exists: true,
    },
  }, {
    sourceRelayer: 'localrelayer',
  });
  console.log('Finished');
  process.exit();
})();
