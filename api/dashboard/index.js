import fs from 'fs';
import blessed from 'blessed';
import {
  exec,
} from 'child_process';
import {
  redisClient,
} from '../redis';
import {
  runGanacheServer,
} from '../ganacheServer';
import {
  subscribeEthEvents,
} from '../sputnik/subscribe';
import {
  runFillQueueHandler,
} from '../sputnik/eventHandlers';
import {
  runWebSocketServer,
} from '../socketServer';
import {
  runApiServer,
} from '../apiServer';
import {
  dashboardFactory,
} from './dashboard';
import dashboardConfig from './.config';

const tmpFile = '/tmp/instexDashboard';
const redisSub = redisClient.duplicate();
const redisDashboardClient = redisClient.duplicate();
const program = blessed.program();

const screen = blessed.screen({
  smartCSR: true,
  autoPadding: true,
  warnings: true,
  sendFocus: true,
  log: './logs/dashboard',
  title: 'Instex dashboard',
});

const scenariosLogger = blessed.log({
  parent: screen,
  width: '50%',
  height: '99%',
  border: 'line',
  label: 'Output',
  tags: true,
  keys: true,
  vi: true,
  mouse: true,
  scrollback: 100,
  scrollbar: {
    ch: ' ',
    track: {
      bg: 'blue',
    },
    style: {
      inverse: true,
    },
  },
});

const processList = blessed.list({
  parent: screen,
  top: '70%',
  width: '50%',
  left: '50%',
  height: '30%',
  border: 'line',
  label: 'Executing List',
  align: 'left',
  mouse: true,
  keys: true,
  scrollable: true,
  vi: true,
  tags: true,
  pad: 100,
  noCellBorders: true,
  style: {
    selected: {
      bg: 'blue',
    },
    border: {
      fg: 'green',
    },
  },
});

const logger = blessed.log({
  parent: screen,
  width: '50%',
  left: '50%',
  height: '70%',
  border: 'line',
  label: 'Logs',
  tags: true,
  keys: true,
  vi: true,
  mouse: true,
  scrollback: 100,
  scrollbar: {
    ch: ' ',
    track: {
      bg: 'blue',
    },
    style: {
      inverse: true,
    },
  },
});

const footer = blessed.box({
  parent: screen,
  width: '100%',
  top: program.rows - 1,
  tags: true,
});

const processes = [{
  id: 'ganacheServer',
  name: 'Ganache server',
  type: 'process',
  run(cb) {
    const server = runGanacheServer(cb);
    return (ccb) => {
      server.close(ccb);
    };
  },
}, {
  id: 'sputnikSubscribe',
  name: 'Sputnik subscribe',
  type: 'process',
  run(cb) {
    const subscriptions = subscribeEthEvents([
      'test',
      // 'main',
      // 'kovan',
    ]);
    cb();
    return (ccb) => {
      subscriptions.forEach(s => s());
      ccb();
    };
  },
}, {
  id: 'socketServer',
  name: 'WebSocket server',
  type: 'process',
  run(cb) {
    const server = runWebSocketServer();
    cb();
    return (ccb) => {
      server.close(ccb);
    };
  },
}, {
  id: 'apiServer',
  name: 'Api server',
  type: 'process',
  run(cb) {
    const server = runApiServer();
    cb();
    return (ccb) => {
      server.close();
      ccb();
    };
  },
}, {
  id: 'fillHandlerQueue',
  name: 'FillHandler queue',
  type: 'process',
  run(cb) {
    const queue = runFillQueueHandler();
    cb();
    return (ccb) => {
      queue.shutdown(5000, ccb);
    };
  },
}];

const scenarios = [{
  id: 'fillOrderERC20',
  name: 'Fill ERC20 Order',
  type: 'scenario',
  run(cb) {
    const child = exec([
      'NODE_ENV=development',
      'babel-node',
      'scenarios/fillOrderERC20.js',
    ].join(' '));
    cb(child);
    child.stdout.on('data', (data) => {
      scenariosLogger.insertBottom(data);
    });
    return (ccb) => {
      child.kill('SIGINT');
      ccb();
    };
  },
}, {
  id: 'fillOrderFees',
  name: 'Fill order fees',
  type: 'scenario',
  run(cb) {
    const child = exec([
      'NODE_ENV=development',
      'babel-node',
      'scenarios/fillOrderFees.js',
    ].join(' '));
    cb(child);
    child.stdout.on('data', (data) => {
      scenariosLogger.insertBottom(data);
    });
    return (ccb) => {
      child.kill('SIGINT');
      ccb();
    };
  },
}, {
  id: 'forwarderBuyERC20Tokens',
  name: 'Forwarder Buy ERC20 Tokens',
  type: 'scenario',
  run(cb) {
    const child = exec([
      'NODE_ENV=development',
      'babel-node',
      'scenarios/forwarderBuyERC20Tokens.js',
    ].join(' '));
    cb(child);
    child.stdout.on('data', (data) => {
      scenariosLogger.insertBottom(data);
    });
    return (ccb) => {
      child.kill('SIGINT');
      ccb();
    };
  },
}, {
  id: 'fillOrderSRA',
  name: 'Fill order SRA',
  type: 'scenario',
  run(cb) {
    const child = exec([
      'NODE_ENV=development',
      'babel-node',
      'scenarios/fillOrderSRA.js',
    ].join(' '));
    cb(child);
    child.stdout.on('data', (data) => {
      scenariosLogger.insertBottom(data);
    });
    return (ccb) => {
      child.kill('SIGINT');
      ccb();
    };
  },
}, {
  id: 'executeTransaction',
  name: 'Execute transaction',
  type: 'scenario',
  run(cb) {
    const child = exec([
      'NODE_ENV=development',
      'babel-node',
      'scenarios/executeTransaction.js',
    ].join(' '));
    cb(child);
    child.stdout.on('data', (data) => {
      scenariosLogger.insertBottom(data);
    });
    return (ccb) => {
      child.kill('SIGINT');
      ccb();
    };
  },
}, {
  id: 'matchOrders',
  name: 'Match orders',
  type: 'scenario',
  run(cb) {
    const child = exec([
      'NODE_ENV=development',
      'babel-node',
      'scenarios/matchOrders.js',
    ].join(' '));
    cb(child);
    child.stdout.on('data', (data) => {
      scenariosLogger.insertBottom(data);
    });
    return (ccb) => {
      child.kill('SIGINT');
      ccb();
    };
  },
}, {
  id: 'cancelOrders',
  name: 'Cancel Orders',
  type: 'scenario',
  run(cb) {
    const child = exec([
      'NODE_ENV=development',
      'babel-node',
      'scenarios/cancelOrders.js',
    ].join(' '));
    cb(child);
    child.stdout.on('data', (data) => {
      scenariosLogger.insertBottom(data);
    });
    return (ccb) => {
      child.kill('SIGINT');
      ccb();
    };
  },
}, {
  id: 'executeTransactionCancelOrder',
  name: 'Execute transaction cancel order',
  type: 'scenario',
  run(cb) {
    const child = exec([
      'NODE_ENV=development',
      'babel-node',
      'scenarios/executeTransactionCancelOrder.js',
    ].join(' '));
    cb(child);
    child.stdout.on('data', (data) => {
      scenariosLogger.insertBottom(data);
    });
    return (ccb) => {
      child.kill('SIGINT');
      ccb();
    };
  },
}];

const tests = [
  {
    id: 'apiServerCreateOrderTest',
    name: 'apiServer - Create order tests',
    type: 'test',
    run(cb) {
      const child = exec([
        'NODE_ENV=test',
        'mocha apiServer/test/postOrder.test.js',
        '--require @babel/register',
        '--timeout 10000',
        '--colors',
        '--exit',
      ].join(' '));
      cb(child);
      child.stdout.on('data', (data) => {
        scenariosLogger.insertBottom(data);
      });
      return (ccb) => {
        child.kill('SIGINT');
        ccb();
      };
    },
  }, {
    id: 'apiTests',
    name: 'Api tests',
    type: 'test',
    run(cb) {
      const child = exec([
        'NODE_ENV=test',
        'mocha apiServer/test/*.test.js',
        '--require @babel/register',
        '--colors',
        '--exit',
      ].join(' '));
      cb(child);
      child.stdout.on('data', (data) => {
        scenariosLogger.insertBottom(data);
      });
      return (ccb) => {
        child.kill('SIGINT');
        ccb();
      };
    },
  },
];

const allItems = [
  ...processes,
  ...tests,
  ...scenarios,
].map(p => ({
  ...p,
  active: dashboardConfig.defaultActiveProcesses.includes(p.id),
}));

const commands = {
  Enter: 'Show process logs',
  r: 'Run process',
  s: 'Stop process',
  j: 'Down',
  k: 'Up',
  g: 'Jump to top',
  G: 'Jump to bottom',
  t: 'Toggle tests/scenarios',
  q: 'Quit',
};

function formatLogMessage(data) {
  return [
    '{bold}',
    '{#0fe1ab-fg}',
    new Date(data.meta.timestamp).toTimeString().split(' ')[0],
    '{/}',
    '{/bold}',
    '_',
    '{bold}',
    data.level,
    '{/bold}',
    ':',
    data.message,
  ].join('');
}

function showLogMessage(message) {
  const data = JSON.parse(message);
  const count = logger.getLines().length;
  screen.log(count);
  if (count >= 1000) {
    logger.deleteTop(((count - 1000) || 1) + 50);
  }
  if (typeof data.message === 'string') {
    logger.log(formatLogMessage(data));
  } else {
    logger.log(formatLogMessage({
      ...data,
      message: '{bold}{#e1e10e-fg}Object print:{/}{/bold}',
    }));
    logger.log(data.message);
  }
}

redisSub.on('message', (channel, message) => {
  showLogMessage(message);
});

const dashboard = dashboardFactory({
  screen,
  processList,
  scenariosLogger,
  footer,
  commands,
  allItems,
  redisSub,
  onShowLogs: (process) => {
    logger.setLabel(`Logs - ${process.name}`);
    logger.setContent('');
    redisDashboardClient.lrange(
      `logsContainer-${process.id}`,
      0,
      200,
      (err, data) => {
        data.reverse().forEach(log => showLogMessage(log));
        logger.scrollTo(logger.getLines().length);
      },
    );
  },
});

fs.readFile(
  tmpFile,
  'utf-8',
  (err, data) => {
    if (err) {
      screen.log(err);
    }
    screen.log(data);
    let selectedIndex = 0;
    dashboard.showProcessLogs(
      allItems.filter(
        (p, i) => {
          if (p.id === data) {
            selectedIndex = i;
          }
          return (
            data ? (p.id === data && p.type === 'process') : true
          );
        },
      )[0] || allItems[0],
    );
    if (['scenario', 'test'].includes(allItems[selectedIndex].type)) {
      dashboard.showTestsAndScenarios();
    }
    processList.select(selectedIndex);
    dashboard.runAll();
  },
);

screen.key('q', () => {
  fs.writeFile(
    tmpFile,
    allItems[processList.selected].id,
    (err) => {
      if (err) {
        screen.log(err);
      }
      dashboard.stopAll();
      screen.destroy();
      setTimeout(() => {
        process.exit(1);
      }, 500);
    },
  );
});
