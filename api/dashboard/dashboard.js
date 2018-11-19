import blessed from 'blessed';
import {
  theme,
} from './theme';


const baseCommands = {
  j: 'Down',
  k: 'Up',
  g: 'Jump to top',
  G: 'Jump to bottom',
  q: 'Quit',
};

export function dashboardFactory({
  screen,
  supervisorWidget,
  allProcesses,
  footerWidget,
  redisSub,
  onRunFgProcess,
  onShowDaemonLogs,
}) {
  const state = {
    processes: (
      allProcesses.reduce((acc, p) => ({
        ...acc,
        [p.id]: {
          ...p,
          status: 'stopped',
        },
      }), {})
    ),
  };
  supervisorWidget.focus();

  function renderProcess(process) {
    const isSelectedForLogs = supervisorWidget.selectedForLogs === process.id;
    const spacesCount = 50 - process.name.length - (isSelectedForLogs ? 1 : 0);
    const color = theme.processType[process.type];
    const coloredName = `{${color}-fg}${process.name}{/${color}-fg}`;
    const { status } = state.processes[process.id];
    const statusColor = theme.processStatus[status];

    return [
      coloredName,
      Array(spacesCount).fill().join(' '),
      isSelectedForLogs
        ? (
          `{${theme.selectedProcess}-fg}◉{/${theme.selectedProcess}-fg}`
        )
        : (
          ''
        ),
      '  ',
      `{${statusColor}-fg}${status}{/${statusColor}-fg}`,
    ].join(' ');
  }

  function renderFooter() {
    const executableList = Object.values(state.processes);
    const selectedProcess = executableList[supervisorWidget.selected];
    const adaptedCommands = selectedProcess.type === 'daemon'
      ? {
        Enter: 'Show daemon logs',
        r: `Run ${selectedProcess.type}`,
        s: `Stop ${selectedProcess.type}`,
      }
      : {
        Enter: `Run ${selectedProcess.type}`,
        s: `Stop ${selectedProcess.type}`,
      };
    const allCommands = {
      ...adaptedCommands,
      ...baseCommands,
    };

    const renderFooterCommand = command => (
      `{white-bg}{black-fg}${command}{/black-fg}{/white-bg} ${allCommands[command]}`
    );
    const adaptedCommandsString = (
      Object.keys(adaptedCommands)
        .map(renderFooterCommand)
        .join('  ')
    );
    const baseCommandsString = (
      Object.keys(baseCommands)
        .map(renderFooterCommand)
        .join('  ')
    );
    const processTypeColorsString = (
      Object.keys(theme.processType)
        .map(type => (
          `{${theme.processType[type]}-fg}☐◼︎◼︎☐ - ${type}{/${theme.processType[type]}-fg}`
        ))
        .join('  ')
    );

    footerWidget.setContent([
      adaptedCommandsString,
      Array(
        60
        - (
          blessed.helpers.stripTags(adaptedCommandsString).length
        ),
      ).fill().join(' '),
      baseCommandsString,
      Array(10).fill().join(' '),
      processTypeColorsString,
    ].join('  '));
  }

  function render() {
    supervisorWidget.setItems(
      Object.values(state.processes)
        .map(p => renderProcess(p)),
    );
    screen.render();
  }

  function setProcessStatus(
    processId,
    status,
  ) {
    state.processes[processId].status = status;
    render();
  }

  function runProcess(process) {
    const { status } = state.processes[process.id];
    if (status === 'stopped') {
      setProcessStatus(
        process.id,
        'starting',
      );
      onRunFgProcess(process);
      state.processes[process.id].stop = process.run((child) => {
        setProcessStatus(
          process.id,
          'running',
        );
        if (process.type !== 'daemon') {
          child.on('exit', () => {
            setProcessStatus(process.id, 'stopped');
          });
        }
      });
    }
  }

  function stopProcess(process) {
    const {
      status,
      stop,
    } = state.processes[process.id];
    if (
      status === 'running'
      && stop
    ) {
      setProcessStatus(
        process.id,
        'stopping',
      );
      state.processes[process.id].stop(() => {
        setProcessStatus(
          process.id,
          'stopped',
        );
      });
    }
  }

  function showDaemonLogs(process) {
    onShowDaemonLogs(process);
    supervisorWidget.selectedForLogs = process.id;

    redisSub.unsubscribe();
    redisSub.subscribe(`logs-${process.id}`);
    render();
  }

  supervisorWidget.on('select item', () => {
    renderFooter();
    screen.render();
  });

  supervisorWidget.key('enter', () => {
    const executableList = Object.values(state.processes);
    const process = executableList[supervisorWidget.selected];
    if (process.type === 'daemon') {
      showDaemonLogs(process);
    } else {
      runProcess(process);
    }
  });

  supervisorWidget.key('r', () => {
    const executableList = Object.values(state.processes);
    const process = executableList[supervisorWidget.selected];
    if (process.type === 'daemon') {
      runProcess(process);
    }
  });

  supervisorWidget.key('s', () => {
    const executableList = Object.values(state.processes);
    const process = executableList[supervisorWidget.selected];
    stopProcess(process);
  });

  return ({
    render,
    setProcessStatus,
    showDaemonLogs,

    runAll() {
      allProcesses
        .forEach(
          p => (
            p.active ? runProcess(p) : renderProcess(p)
          ),
        );
    },

    stopAll() {
      allProcesses
        .filter(p => p.active)
        .forEach(
          p => (
            stopProcess(p)
          ),
        );
    },
  });
}

export default dashboardFactory;
