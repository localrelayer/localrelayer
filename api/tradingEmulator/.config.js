import { GANACHE_CONFIGS } from "./constants";

export default {
  mnemonic: 'concert load couple harbor equip island argue ramp clarify fence smart topic',
  baseDerivationPath: "44'/60'/0'/0",
  relayerUrl: 'http://localhost:5001/v2/',
  network: GANACHE_CONFIGS,
  orderSubmitter: {
    quantity: 10,
    interval: 1000 * 10,
  },
  orderFiller: {
    quantity: 1,
    interval: 2000,
  }
}