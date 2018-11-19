import 'module-alias/register';
import fs from 'fs';

import {
  redisClient,
} from 'redisClient';
import {
  dashboardFactory,
} from './dashboard';
import {
  daemons,
  tests,
  scenarios,
} from './starters';
import {
  screen,
  fgProcessLoggerWidget,
  supervisorWidget,
  daemonLoggerWidget,
  footerWidget,
} from './widgets';
import {
  theme,
} from './theme';
import dashboardConfig from './.config';


const redisSub = redisClient.duplicate();
const redisDashboardClient = redisClient.duplicate();
const allProcesses = [
  ...daemons,
  ...tests,
  ...scenarios,
].map(p => ({
  ...p,
  active: dashboardConfig.defaultActiveProcesses.includes(p.id),
}));

function formatLogMessage(data) {
  return [
    '{bold}',
    `{${theme.dateLog}-fg}`,
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
  const count = daemonLoggerWidget.getLines().length;
  screen.log(count);
  if (count >= 1000) {
    daemonLoggerWidget.deleteTop(((count - 1000) || 1) + 50);
  }
  if (typeof data.message === 'string') {
    daemonLoggerWidget.log(formatLogMessage(data));
  } else {
    daemonLoggerWidget.log(formatLogMessage({
      ...data,
      message: `{bold}{${theme.objectLog}-fg}Object print:{/}{/bold}`,
    }));
    daemonLoggerWidget.log(data.message);
  }
}

function saveLastUsedData() {
  fs.writeFile(
    dashboardConfig.tmpFile,
    [
      supervisorWidget.selectedForLogs
      || allProcesses[0].id,
      fgProcessLoggerWidget.lastExecutedProcess
      || allProcesses[0].id,
    ].join(';'),
    (err) => {
      if (err) {
        screen.log(err);
      }
    },
  );
}

redisSub.on('message', (channel, message) => {
  showLogMessage(message);
});

const dashboard = dashboardFactory({
  screen,
  supervisorWidget,
  footerWidget,
  allProcesses,
  redisSub,
  onRunFgProcess: (process) => {
    fgProcessLoggerWidget.setLabel(`Output - ${process.name}`);
    fgProcessLoggerWidget.lastExecutedProcess = process.id;
    saveLastUsedData();
  },
  onShowDaemonLogs: (process) => {
    daemonLoggerWidget.setLabel([
      'Daemon logs - ',
      `{${theme.processType.daemon}-fg}`,
      process.name,
      `{/${theme.processType.daemon}-fg}`,
    ].join(''));
    daemonLoggerWidget.setContent('');
    saveLastUsedData();
    redisDashboardClient.lrange(
      `logsContainer-${process.id}`,
      0,
      200,
      (err, data) => {
        data.reverse().forEach(log => showLogMessage(log));
        daemonLoggerWidget.scrollTo(daemonLoggerWidget.getLines().length);
      },
    );
  },
});

fs.readFile(
  dashboardConfig.tmpFile,
  'utf-8',
  (err, data) => {
    if (err) {
      screen.log(err);
    }
    const [
      daemonId,
      selectId,
    ] = (
      data || ';'
    ).split(';');
    screen.log(data);
    const selectedIndex = allProcesses.findIndex(p => p.id === selectId);

    dashboard.showDaemonLogs(
      allProcesses.filter(
        p => (
          daemonId
            ? (
              p.id === daemonId
              && p.type === 'daemon'
            )
            : true
        ),
      )[0] || allProcesses[0],
    );
    supervisorWidget.select(
      selectedIndex > -1
        ? selectedIndex
        : 0,
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
