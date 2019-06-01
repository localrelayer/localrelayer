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
  orderWatcher: {
    forkProcess: true,
    logLevel: 'silly',
    ethNetworks: [
      'test',
    ],
  },
  sputnikSubscribe: {
    forkProcess: true,
    logLevel: 'silly',
    ethNetworks: [
      'test',
    ],
  },
  ganacheServer: {
    forkProcess: true,
    logLevel: 'silly',
  },
  defaultActiveProcesses: [
    'orderWatcher',
    'socketServer',
    'ganacheServer',
  ],
  fgProcessLogLevel: 'silly',
  nodemonDelay: 0,
  tmpFile: '/tmp/localrelayerDashboard',
};
