import 'module-alias/register';
import {
  assetDataUtils,
} from '0x.js';
import {
  performance,
} from 'perf_hooks';
import Config from './.config';
import {
  orderSubmitter,
  orderFiller,
  prepareAccounts,
} from './modules';
import {
  web3Wrapper,
  httpClient,
} from './connector';
import {
  logger,
} from './emulatorLogger';
import {
  shuffle,
} from './helpers';

const emulator = async () => {
  logger.debug('EMULATOR STARTED');

  const addresses = await web3Wrapper.getAvailableAddressesAsync();
  const response = await httpClient.getAssetPairsAsync({
    networkId: Config.network.networkId,
  });

  const { records: assetPairs } = response;
  const { assetDataA, assetDataB } = assetPairs[0];

  const assetA = assetDataUtils.decodeERC20AssetData(assetDataA.assetData);
  const assetB = assetDataUtils.decodeERC20AssetData(assetDataB.assetData);

  const t0 = performance.now();

  await prepareAccounts({
    assetA,
    assetB,
    addresses,
  });

  const t1 = performance.now();

  logger.debug(`ALLOWANCE AND DEPOSIT TOOK  - ${t1 - t0} ml`);

  setInterval(() => {
    orderSubmitter({
      orderConfig: {
        pair: {
          assetA,
          assetB,
        },
        addresses: shuffle(addresses),
      },
      quantity: Config.orderSubmitter.quantity,
    });
  }, Config.orderSubmitter.interval);

  setInterval(() => {
    orderFiller({
      orderConfig: {
        pair: {
          assetA,
          assetB,
        },
        addresses: shuffle(addresses),
      },
      quantity: Config.orderFiller.quantity,
    });
  }, Config.orderFiller.interval);
};

try {
  emulator();
} catch (e) {
  logger.error('ERROR %j', e);
}
