import blessed from 'blessed';

export const program = blessed.program();

export const screen = blessed.screen({
  smartCSR: true,
  autoPadding: true,
  warnings: true,
  sendFocus: true,
  log: './logs/dashboard',
  title: 'Instex dashboard',
});

export const fgProcessLoggerWidget = blessed.log({
  parent: screen,
  width: '50%',
  height: '99%',
  border: 'line',
  label: 'Foregroung process logs',
  tags: true,
  keys: true,
  vi: true,
  mouse: true,
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

export const supervisorWidget = blessed.list({
  parent: screen,
  top: '70%',
  width: '50%',
  left: '50%',
  height: '30%',
  border: 'line',
  label: 'Supervisor',
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

export const daemonLoggerWidget = blessed.log({
  parent: screen,
  width: '50%',
  left: '50%',
  height: '70%',
  border: 'line',
  label: 'Daemon logs',
  tags: true,
  keys: true,
  vi: true,
  mouse: true,
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

export const footerWidget = blessed.box({
  parent: screen,
  width: '100%',
  top: program.rows - 1,
  tags: true,
});
