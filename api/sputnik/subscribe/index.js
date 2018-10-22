import {
  subscribeOnEvents,
} from './ethLogStreamer';
import jobs from '../kueJobs';
import {
  logger,
} from '../sputnikLogger';


const watchEvents = {
  ERC20Token: [
    'Transfer',
    'Approval',
  ],
  ERC721Token: [
    'Transfer',
    'Approval',
    'ApprovalForAll',
  ],
  Exchange: [
    'Fill',
    'Cancel',
    'CancelUpTo',
  ],
  WETH9: [
    'Approval',
    'Transfer',
    'Deposit',
    'Withdrawal',
  ],
};

const networksMapName = {
  main: 1,
  kovan: 42,
  test: 50,
};

export function subscribeEthEvents(networks) {
  return networks.map((networkName) => {
    const networkId = networksMapName[networkName];
    return subscribeOnEvents({
      networkName,
      watchEvents,
      handler: (log) => {
        logger.debug('=======Log Handler=======');
        logger.debug(`Network id: ${networkId}`);
        logger.debug(log);
        jobs.create(
          log.event === 'Fill' ? 'ExchangeFillEvent' : 'EthEvent',
          {
            log,
            networkId,
            networkName,
          },
        ).save();
        logger.debug('=======/Log Handler=======');
      },
    });
  });
}
