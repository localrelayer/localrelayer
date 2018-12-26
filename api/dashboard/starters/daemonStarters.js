import {
  spawn,
} from 'child_process';

import {
  runGanacheServer,
} from '../../ganacheServer';
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
    daemonLoggerWidget.insertBottom(data.toString('utf8'));
    screen.render();
  }
};

function daemonStarter(processId, cb, cmd) {
  const cwd = process.cwd();
  const [command, ...commandArgs] = cmd.split(' ');
  const child = spawn(
    command,
    commandArgs,
    {
      cwd,
      shell: true,
      env: {
        ...process.env,
        NODE_ENV: 'development',
        DASHBOARD_PARENT: 'true',
        ETH_NETWORKS: dashboardConfig.orderWatcher.ethNetworks.join(','),
        LOG_LEVEL: dashboardConfig[processId].logLevel,
      },
    },
  );
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
        'npm run orderWatcher',
      );
    }
    const queue = runFillQueueHandler();
    cb();
    return (ccb) => {
      queue.shutdown(5000, ccb);
    };
  },
}, {
  id: 'sraSynchronizer:radar:main',
  name: 'radar main net syncronizer',
  type: 'daemon',

  run(cb) {
    if (dashboardConfig['sraSynchronizer:radar:main'].forkProcess) {
      return daemonStarter(
        'sraSynchronizer:radar:main',
        cb,
        'npm run sraSynchronizer:radar:main',
      );
    }
    cb();
    return (ccb) => {
      ccb();
    };
  },
}, {
  id: 'sraSynchronizer:radar:kovan',
  name: 'radar kovan net syncronizer',
  type: 'daemon',

  run(cb) {
    if (dashboardConfig['sraSynchronizer:radar:kovan'].forkProcess) {
      return daemonStarter(
        'sraSynchronizer:radar:kovan',
        cb,
        'npm run sraSynchronizer:radar:kovan',
      );
    }
    cb();
    return (ccb) => {
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
