import {
  ContractWrappers,
} from '@0x/contract-wrappers';
import {
  Web3Wrapper,
} from '@0x/web3-wrapper';
import {
  BigNumber,
} from '@0x/utils';
import {
  initTestProvider,
} from './utils';
import {
  getContractAddressesForNetwork,
} from '../../scenarios/utils/contracts';

(async () => {
  const engine = initTestProvider();
  const networkId = 50;
  const contractAddresses = getContractAddressesForNetwork(networkId);
  const contractWrappers = new ContractWrappers(
    engine,
    {
      networkId,
      contractAddresses,
    },
  );
  const web3Wrapper = new Web3Wrapper(engine);
  const [makerAddress] = await web3Wrapper.getAvailableAddressesAsync();
  try {
    await contractWrappers.erc20Token.setUnlimitedProxyAllowanceAsync(
      contractAddresses.etherToken,
      makerAddress,
    );
    await contractWrappers.erc20Token.setUnlimitedProxyAllowanceAsync(
      contractAddresses.zrxToken,
      makerAddress,
    );
    await contractWrappers.etherToken.depositAsync(
      contractAddresses.etherToken,
      Web3Wrapper.toBaseUnitAmount(new BigNumber(1), 18),
      makerAddress,
    );
  } catch (e) {
    console.log('WTF', e);
  }
  console.log('DONE');
  engine.stop();
  process.exit();
})();
