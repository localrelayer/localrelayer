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
    sourceRelayer: 'instex',
  });
  console.log('Finished');
  process.exit();
})();
