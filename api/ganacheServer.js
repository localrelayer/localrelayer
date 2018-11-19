import 'module-alias/register';
import ganache from 'ganache-core';
import {
  createLogger,
} from 'logger';

export const logger = createLogger(
  'ganacheServer',
  process.env.LOG_LEVEL || 'silly',
  (
    require.main === module
    && process.env.DASHBOARD_PARENT !== 'true'
  ),
);
logger.debug('ganacheServer logger was created');


export function runGanacheServer(cb) {
  const options = {
    port: 8545,
    hostname: '127.0.0.1',
    mnemonic: 'concert load couple harbor equip island argue ramp clarify fence smart topic',
    total_accounts: 10,
    default_balance_ether: 100,
    gasPrice: 20000000000,
    gasLimit: 6721975,
    network_id: 50,
    db_path: './0x_ganache_snapshot',
  };

  logger.info('Ganache server options');
  logger.info(options);

  const server = ganache.server(options);
  server.listen(8545, '127.0.0.1', (err, result) => {
    if (err) {
      logger.error(err);
      return;
    }

    const state = result || server.provider.manager.state;
    const { accounts } = state;
    const addresses = Object.keys(accounts);
    logger.info('Available Accounts');
    logger.info('==================');
    logger.info(addresses);

    logger.info('Private Keys');
    logger.info('==================');
    addresses.forEach((address, index) => {
      logger.info(`(${index}) 0x${accounts[address].secretKey.toString('hex')}`);
    });

    logger.info('HD Wallet');
    logger.info('==================');
    logger.info(`Mnemonic:      ${state.mnemonic}`);
    logger.info(`Base HD Path:  ${state.wallet_hdpath}{account_index}`);

    logger.info('Gas Price');
    logger.info('==================');
    logger.info(options.gasPrice);

    logger.info('Gas Limit');
    logger.info('==================');
    logger.info(options.gasLimit);

    logger.info(`Listening on {#0fe1ab-fg}${options.hostname}:${options.port}{/}`);
    if (cb) cb(server);
  });

  process.on('SIGINT', () => {
    // graceful shutdown
    server.close((err) => {
      if (err) {
        console.log(err.stack || err);
      }
      process.exit();
    });
  });

  return server;
}

if (require.main === module) {
  runGanacheServer();
}
