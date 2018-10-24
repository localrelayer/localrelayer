import {
  RPCSubprovider, Web3ProviderEngine,
} from '0x.js';
import {
  MnemonicWalletSubprovider,
} from '@0xproject/subproviders';

export const mnemonicWallet = new MnemonicWalletSubprovider({
  mnemonic: 'concert load couple harbor equip island argue ramp clarify fence smart topic',
  baseDerivationPath: '44\'/60\'/0\'/0',
});

export const pe = new Web3ProviderEngine();
pe.addProvider(mnemonicWallet);
pe.addProvider(new RPCSubprovider('http://127.0.0.1:8545'));
pe.start();

export const providerEngine = pe;
