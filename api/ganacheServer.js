import ganache from 'ganache-core';


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
    // logger: console,
  };

  const server = ganache.server(options);
  server.listen(8545, '127.0.0.1', (err, result) => {
    if (err) {
      console.log(err);
      return;
    }

    const state = result || server.provider.manager.state;

    console.log('');
    console.log('Available Accounts');
    console.log('==================');

    const { accounts } = state;
    const addresses = Object.keys(accounts);

    console.log('');
    console.log('Private Keys');
    console.log('==================');

    addresses.forEach((address, index) => {
      console.log(`(${index}) 0x${accounts[address].secretKey.toString('hex')}`);
    });

    console.log('');
    console.log('HD Wallet');
    console.log('==================');
    console.log(`Mnemonic:      ${state.mnemonic}`);
    console.log(`Base HD Path:  ${state.wallet_hdpath}{account_index}`);

    console.log('');
    console.log('Gas Price');
    console.log('==================');
    console.log(options.gasPrice);

    console.log('');
    console.log('Gas Limit');
    console.log('==================');
    console.log(options.gasLimit);

    console.log('');
    console.log(`Listening on ${options.hostname}:${options.port}`);
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
