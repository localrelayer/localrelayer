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

function testStarter(cb, testFilesPath) {
  const cwd = process.cwd();
  const child = spawn(
    'mocha',
    [
      testFilesPath,
      '--require @babel/register',
      '--require module-alias/register',
      '--timeout 10000',
      '--colors',
      '--exit',
    ],
    {
      cwd,
      shell: true,
      env: {
        ...process.env,
        NODE_ENV: 'test',
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

export const tests = [
  {
    id: 'apiServerCreateOrderTest',
    name: 'apiServer - postOrder test',
    type: 'test',

    run(cb) {
      return testStarter(
        cb,
        'apiServer/test/postOrder.test.js',
      );
    },
  }, {
    id: 'apiTests',
    name: 'apiServer - All tests',
    type: 'test',

    run(cb) {
      return testStarter(
        cb,
        'apiServer/test/*.test.js',
      );
    },
  }, {
    id: 'checkOrderWatcherEvents',
    name: 'sputnik - orderWatcher events',
    type: 'test',

    run(cb) {
      return testStarter(
        cb,
        'sputnik/tests/orderWatcher.test.js',
      );
    },
  },
];
