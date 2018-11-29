import {
  spawn,
} from 'child_process';

import {
  fgProcessLoggerWidget,
  screen,
} from '../widgets';
import dashboardConfig from '../.config';


const fgProcessOutputHandler = (data) => {
  fgProcessLoggerWidget.insertBottom(data.toString('utf8'));
  screen.render();
};

function scenarioStarter(cb, scenarioFilePath) {
  const cwd = process.cwd();
  const child = spawn(
    'babel-node',
    [scenarioFilePath],
    {
      cwd,
      shell: true,
      env: {
        ...process.env,
        NODE_ENV: 'development',
        DASHBOARD_PARENT: 'true',
        ETH_NETWORKS: dashboardConfig.orderWatcher.ethNetworks.join(','),
        LOG_LEVEL: dashboardConfig.fgProcessLogLevel,
      },
    },
  );
  cb(child);
  child.stderr.on('data', fgProcessOutputHandler);
  child.stdout.on('data', fgProcessOutputHandler);
  return (ccb) => {
    child.kill('SIGINT');
    ccb();
  };
}

export const scenarios = [{
  id: 'fillOrderERC20',
  name: 'Fill ERC20 Order',
  type: 'scenario',

  run(cb) {
    return scenarioStarter(
      cb,
      'scenarios/fillOrderERC20.js',
    );
  },
}, {
  id: 'fillOrderFees',
  name: 'Fill order fees',
  type: 'scenario',

  run(cb) {
    return scenarioStarter(
      cb,
      'scenarios/fillOrderFees.js',
    );
  },
}, {
  id: 'forwarderBuyERC20Tokens',
  name: 'Forwarder Buy ERC20 Tokens',
  type: 'scenario',

  run(cb) {
    return scenarioStarter(
      cb,
      'scenarios/forwarderBuyERC20Tokens.js',
    );
  },
}, {
  id: 'fillOrderSRA',
  name: 'Fill order SRA',
  type: 'scenario',

  run(cb) {
    return scenarioStarter(
      cb,
      'scenarios/fillOrderSRA.js',
    );
  },
}, {
  id: 'executeTransaction',
  name: 'Execute transaction',
  type: 'scenario',

  run(cb) {
    return scenarioStarter(
      cb,
      'scenarios/executeTransaction.js',
    );
  },
}, {
  id: 'matchOrders',
  name: 'Match orders',
  type: 'scenario',

  run(cb) {
    return scenarioStarter(
      cb,
      'scenarios/matchOrders.js',
    );
  },
}, {
  id: 'cancelOrders',
  name: 'Cancel Orders',
  type: 'scenario',

  run(cb) {
    return scenarioStarter(
      cb,
      'scenarios/cancelOrders.js',
    );
  },
}, {
  id: 'executeTransactionCancelOrder',
  name: 'Execute transaction cancel order',
  type: 'scenario',

  run(cb) {
    return scenarioStarter(
      cb,
      'scenarios/executeTransactionCancelOrder.js',
    );
  },
}];
