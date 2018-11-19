import {
  exec,
} from 'child_process';

import {
  fgProcessLoggerWidget,
} from '../widgets';
import dashboardConfig from '../.config';


const fgProcessOutputHandler = (data) => {
  fgProcessLoggerWidget.insertBottom(data);
};

function scenarioStarter(cb, scenarioFilePath) {
  const child = exec([
    'DASHBOARD_PARENT=true',
    `LOG_LEVEL=${dashboardConfig.fgProcessLogLevel}`,
    'NODE_ENV=development',
    'babel-node',
    scenarioFilePath,
  ].join(' '));
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
