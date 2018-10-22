import fs from 'fs';
import blessed from 'blessed';

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

const processes = [{
  id: 'ganacheServer',
  name: 'Ganache server',
  run(cb) {
    const server = runGanacheServer(cb);
    return (ccb) => {
      server.close(ccb);
    };
  },
}, {
  id: 'sputnikSubscribe',
  name: 'Sputnik subscribe',
  run(cb) {
    const subscriptions = subscribeEthEvents([
      'test',
      'main',
      'kovan',
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
  run(cb) {
    const server = runApiServer();
    cb();
    return (ccb) => {
      server.close(ccb);
    };
  },
}, {
  id: 'fillHandlerQueue',
  name: 'FillHandler queue',
  run(cb) {
    const queue = runFillQueueHandler();
    cb();
    return (ccb) => {
      queue.shutdown(5000, ccb);
    };
  },
}].map(p => ({
  ...p,
  active: dashboardConfig.defaultActiveProcesses.includes(p.id),
}));

const screen = blessed.screen({
  smartCSR: true,
  autoPadding: true,
  warnings: true,
  sendFocus: true,
  log: './logs/dashboard',
  title: 'Instex dashboard',
});

const processList = blessed.list({
  parent: screen,
  top: '70%',
  left: '50%',
  width: '50%',
  height: '30%',
  border: 'line',
  label: 'Processes',
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
  width: '100%',
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

const scenariousLogger = blessed.log({
  parent: screen,
  top: '70%',
  width: '50%',
  height: '30%',
  border: 'line',
  label: 'Scenarious logs',
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
scenariousLogger.setContent('{#e1e10e-fg}TODO: show scenarious logs{/}');

const footer = blessed.box({
  parent: screen,
  width: '100%',
  top: program.rows - 1,
  tags: true,
});
const commands = {
  Enter: 'Show process logs',
  r: 'Run process',
  s: 'Stop process',
  j: 'Down',
  k: 'Up',
  g: 'Jump to top',
  G: 'Jump to bottom',
  q: 'Quit',
};
const footerText = Object.keys(commands).map(key => (
  `{white-bg}{black-fg}${key}{/black-fg}{/white-bg} ${commands[key]}`
)).join('  ');
footer.setContent(footerText);

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
  redisSub,
  processes,
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
    fs.writeFile(
      tmpFile,
      process.id,
      (err) => {
        if (err) {
          screen.log(err);
        }
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
    dashboard.showProcessLogs(
      processes.filter(
        p => (
          data ? p.id === data : true
        ),
      )[0],
    );
    dashboard.runAll();
  },
);

screen.key('q', () => {
  dashboard.stopAll();
  screen.destroy();
  setTimeout(() => {
    process.exit(1);
  }, 500);
});
