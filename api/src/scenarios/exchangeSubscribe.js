import {
  assetDataUtils,
  ContractWrappers,
  ExchangeEvents,
} from '0x.js';

import {
  PrintUtils,
} from './utils/printing';
import {
  providerEngine,
} from './utils/providerEngine';
import {
  GANACHE_NETWORK_ID,
} from './utils/constants';

/**
 * In this scenario, we will subscribe to the Exchange events, listening for Fills. This
 * will create a process to listen to the events, execute another scenario such as fill_order
 * to see the logs printed out.
 */
export async function scenarioAsync() {
  PrintUtils.printScenario('Exchange Subscribe');
  // Initialize the ContractWrappers, this provides helper functions around calling
  // 0x contracts as well as ERC20/ERC721 token contracts on the blockchain
  const contractWrappers = new ContractWrappers(
    providerEngine,
    {
      networkId: GANACHE_NETWORK_ID,
    },
  );
  // No filter, get all of the Fill Events
  const filterValues = {};
  // Subscribe to the Fill Events on the Exchange
  contractWrappers.exchange.subscribe(
    ExchangeEvents.Fill,
    filterValues,
    (err, decodedLogEvent) => {
      if (err) {
        console.log('error:', err);
        providerEngine.stop();
      } else if (decodedLogEvent) {
        const fillLog = decodedLogEvent.log;
        const makerAssetData = assetDataUtils.decodeERC20AssetData(fillLog.args.makerAssetData);
        const takerAssetData = assetDataUtils.decodeERC20AssetData(fillLog.args.takerAssetData);
        PrintUtils.printData('Fill Event', [
          ['orderHash', fillLog.args.orderHash],
          ['makerAddress', fillLog.args.makerAddress],
          ['takerAddress', fillLog.args.takerAddress],
          ['makerAssetFilledAmount', fillLog.args.makerAssetFilledAmount.toString()],
          ['takerAssetFilledAmount', fillLog.args.takerAssetFilledAmount.toString()],
          ['makerFeePaid', fillLog.args.makerFeePaid.toString()],
          ['takerFeePaid', fillLog.args.takerFeePaid.toString()],
          ['makerTokenAddress', makerAssetData.tokenAddress],
          ['takerTokenAddress', takerAssetData.tokenAddress],
        ]);
      }
    },
  );
}

(async () => {
  try {
    if (!module.parent) {
      await scenarioAsync();
    }
  } catch (e) {
    console.log(e);
    providerEngine.stop();
    process.exit(1);
  }
})();
