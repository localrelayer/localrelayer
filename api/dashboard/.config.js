export default {
  apiServer: {
    forkProcess: true,
    logLevel: 'silly',
  },
  socketServer: {
    forkProcess: true,
    logLevel: 'silly',
  },
  fillQueueHandler: {
    forkProcess: true,
    logLevel: 'silly',
  },
  sputnikSubscribe: {
    forkProcess: true,
    logLevel: 'silly',
    ethNetworks: [
      'test',
       'main',
       'kovan',
    ],
  },
  ganacheServer: {
    forkProcess: true,
    logLevel: 'silly',
  },
  defaultActiveProcesses: [
    'apiServer',
    'socketServer',
    'fillQueueHandler',
    'sputnikSubscribe',
    'ganacheServer',
  ],
  fgProcessLogLevel: 'silly',
  nodemonDelay: 0,
  tmpFile: '/tmp/instexDashboard',
};
