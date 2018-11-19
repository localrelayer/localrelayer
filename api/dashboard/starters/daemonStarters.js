import {
  exec,
} from 'child_process';

import {
  runGanacheServer,
} from '../../ganacheServer';
import {
  subscribeEthEvents,
} from '../../sputnik/subscribe';
import {
  runFillQueueHandler,
} from '../../sputnik/eventHandlers';
import {
  runWebSocketServer,
} from '../../socketServer';
import {
  runApiServer,
} from '../../apiServer';
import {
  daemonLoggerWidget,
  supervisorWidget,
  screen,
} from '../widgets';
import dashboardConfig from '../.config';


const daemonProcessOutputHandler = processId => (data) => {
  if (supervisorWidget.selectedForLogs === processId) {
    daemonLoggerWidget.insertBottom(data);
    screen.render();
  }
};

function daemonStarter(processId, cb, cmd) {
  const child = exec([
    'NODE_ENV=development',
    'DASHBOARD_PARENT=true',
    `LOG_LEVEL=${dashboardConfig[processId].logLevel}`,
    cmd,
  ].join(' '));
  cb(child);
  child.stderr.on('data', daemonProcessOutputHandler(processId));
  child.stdout.on('data', daemonProcessOutputHandler(processId));
  return (ccb) => {
    child.kill('SIGINT');
    ccb();
  };
}

export const daemons = [{
  id: 'apiServer',
  name: 'Api server',
  type: 'daemon',

  run(cb) {
    if (dashboardConfig.apiServer.forkProcess) {
      return daemonStarter(
        'apiServer',
        cb,
        'npm run api',
      );
    }
    const server = runApiServer();
    cb();
    return (ccb) => {
      server.close();
      ccb();
    };
  },
}, {
  id: 'socketServer',
  name: 'WebSocket server',
  type: 'daemon',

  run(cb) {
    if (dashboardConfig.socketServer.forkProcess) {
      return daemonStarter(
        'socketServer',
        cb,
        'npm run socket',
      );
    }
    const server = runWebSocketServer();
    cb();
    return (ccb) => {
      server.close(ccb);
    };
  },
}, {
  id: 'orderWatcher',
  name: 'Order watcher',
  type: 'daemon',

  run(cb) {
    if (dashboardConfig.orderWatcher.forkProcess) {
      return daemonStarter(
        'orderWatcher',
        cb,
        `ETH_NETWORKS=${dashboardConfig.orderWatcher.ethNetworks.join(',')} npm run orderWatcher`,
      );
    }
    const queue = runFillQueueHandler();
    cb();
    return (ccb) => {
      queue.shutdown(5000, ccb);
    };
  },
}, {
  id: 'fillQueueHandler',
  name: 'Fill queue handler',
  type: 'daemon',

  run(cb) {
    if (dashboardConfig.fillQueueHandler.forkProcess) {
      return daemonStarter(
        'fillQueueHandler',
        cb,
        'npm run fillQueueHandler',
      );
    }
    const queue = runFillQueueHandler();
    cb();
    return (ccb) => {
      queue.shutdown(5000, ccb);
    };
  },
}, {
  id: 'sputnikSubscribe',
  name: 'Sputnik subscribe',
  type: 'daemon',

  run(cb) {
    if (dashboardConfig.sputnikSubscribe.forkProcess) {
      return daemonStarter(
        'sputnikSubscribe',
        cb,
        `ETH_NETWORKS=${dashboardConfig.sputnikSubscribe.ethNetworks.join(',')} npm run sputnik`,
      );
    }
    const subscriptions = subscribeEthEvents(
      dashboardConfig.sputnikSubscribe.ethNetworks,
    );
    cb();
    return (ccb) => {
      subscriptions.forEach(s => s());
      ccb();
    };
  },
}, {
  id: 'ganacheServer',
  name: 'Ganache server',
  type: 'daemon',

  run(cb) {
    if (dashboardConfig.ganacheServer.forkProcess) {
      return daemonStarter(
        'ganacheServer',
        cb,
        'npm run ganache',
      );
    }
    const server = runGanacheServer(cb);
    return (ccb) => {
      server.close(ccb);
    };
  },
}];
