import {
  subscribeOnEvents,
} from './ethLogStreamer';
import jobs from '../kueJobs';


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

export function subscribeExchangeEvents(networks) {
  networks.forEach((networkName) => {
    const networkId = networksMapName[networkName];
    subscribeOnEvents({
      networkName,
      watchEvents,
      handler: (log) => {
        console.log('=======Log Handler=======');
        console.log(networkId);
        console.log(log);
        jobs.create(
          log.event === 'Fill' ? 'ExchangeFillEvent' : 'EthEvent',
          {
            log,
            networkId,
            networkName,
          },
        ).save();
        console.log('=======Log Handler=======');
      },
    });
  });
}
