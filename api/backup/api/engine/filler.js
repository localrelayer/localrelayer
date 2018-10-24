import {
  uniq,
} from 'lodash';
import moment from 'moment';
import { appLogger as logger } from '../../utils/logger';
import {
  zeroEx,
  formatZrxOrder,
  MAX_WAIT_TIME,
} from '../../web3';
import { orders } from '../../models';
import { pgBookshelf as pg } from '../../db';
import socket from '../../socket';
import BigNumber from '../../utils/BigNumber';
import { promiseTimeout, wait, catchError } from '../../utils/helpers';

const ordersCollection = pg.Collection.extend({
  model: orders
});


const batchFillOrders = async ({ fillRequests }) => {
  const addresses = await zeroEx.getAvailableAddressesAsync();
  const NODE_ADDRESS = addresses[0];

  // console.log('WAITING 1minute');
  // await wait(60000);
  // console.log('END WAITING 1minute');

  const respObj = {
    fillRequests
  };

  try {
    // throw new Error('test transaction fail');

    const formattedFillRequests = fillRequests.map(req => ({
      ...req,
      signedOrder: formatZrxOrder(req.signedOrder),
      takerTokenFillAmount: BigNumber(req.takerTokenFillAmount),
    }));
    let txHash;
    try {
      txHash = await zeroEx.exchange.batchFillOrKillAsync(formattedFillRequests, NODE_ADDRESS);
      logger.log('info', 'tx %s', txHash);
    } catch (e) {
      logger.log('error', 'BatchFillOrKill error %s', e);
      catchError(e);
    }

    if (!txHash) {
      throw new Error('No tx hash returned');
    }

    const sendAddresses = uniq(fillRequests.map(order => order.attributes.maker_address));


    logger.log('info', 'sending tx to %j', sendAddresses);

    sendAddresses.forEach((address) => {
      socket.io.to(address).emit('new_message', {
        txHash,
      });
    });

    const response = await promiseTimeout(MAX_WAIT_TIME, zeroEx.awaitTransactionMinedAsync(txHash));

    logger.log('debug', 'mined: %j', response);

    respObj.txHash = txHash;
  } catch (e) {
    logger.log('error', 'Filling error %s', e.toString());

    if (process.env.NODE_ENV !== 'test') {
      await ordersCollection
        .forge(
          fillRequests.map(order => ({
            ...order.attributes,
            status: 'failed',
            completed_at: moment().toISOString(),
          }))
        )
        .invokeThen('save');
      // Send updated orders to everyone (with failed status)
      socket.io.emit('new_message', {
        matchedIds: fillRequests.map(order => order.attributes.id),
        token: fillRequests[0].attributes.token_address,
      });
    }
  }

  return respObj;
};

export default batchFillOrders;
