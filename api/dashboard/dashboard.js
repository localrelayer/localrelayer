export function dashboardFactory({
  screen,
  processList,
  scenarios,
  redisSub,
  processes,
  onShowLogs,
}) {
  let state = {
    selectedForLogs: '',
    scenariosStatus: 'close',
    ...(processes.concat(scenarios).reduce((acc, p) => ({
      ...acc,
      [p.id]: {
        ...p,
        status: 'stopped',
      },
    }), {})),
  };
  processList.focus();
  screen.render();
  function getStatus(processId) {
    const { status } = state[processId];
    switch (status) {
      case 'stopped':
      case 'starting':
      case 'stopping':
      case 'running':
        return `{green-fg}${status}{/green-fg}`;
      default:
        return null;
    }
  }

  function renderProcess(process) {
    const isSelectedForLogs = state.selectedForLogs === process.id;
    const spacesCount = 50 - process.name.length - (isSelectedForLogs ? 1 : 0);
    return [
      process.name,
      Array(spacesCount).fill().join(' '),
      isSelectedForLogs ? '*' : '',
      `${getStatus(process.id)}`.toString(),
    ].join(' ');
  }

  function render() {
    // in order to get executable list omitting selectedForLogs field
    const executableList = state.scenariosStatus === 'open'
      ? Object.values(state).filter(
        item => typeof item !== 'string',
      )
      : Object.values(state).filter(
        item => (
          typeof item !== 'string' && item.type === 'process'
        ),
      );
    processList.setItems(
      executableList
        .map(p => renderProcess(p)),
    );
    screen.render();
  }

  function setProcessStatus(
    processId,
    status,
  ) {
    state[processId].status = status;
    render();
  }

  function runProcess(process) {
    const { status } = state[process.id];
    if (status === 'stopped') {
      setProcessStatus(
        process.id,
        'starting',
      );
      state[process.id].stop = process.run(() => {
        setProcessStatus(
          process.id,
          'running',
        );
      });
    }
  }

  function stopProcess(process) {
    const {
      status,
      stop,
    } = state[process.id];
    if (
      status === 'running'
      && stop
    ) {
      setProcessStatus(
        process.id,
        'stopping',
      );
      state[process.id].stop(() => {
        setProcessStatus(
          process.id,
          'stopped',
        );
      });
    }
  }

  function showProcessLogs(process) {
    onShowLogs(process);
    state.selectedForLogs = process.id;

    redisSub.unsubscribe();
    redisSub.subscribe(`logs-${process.id}`);
    render();
  }
  processList.key('enter', () => {
    const executableList = Object.values(state).filter(item => typeof item !== 'string');
    const process = executableList[processList.selected];
    showProcessLogs(process);
  });

  processList.key('r', () => {
    const executableList = Object.values(state).filter(item => typeof item !== 'string');
    const process = executableList[processList.selected];
    runProcess(process);
  });

  processList.key('s', () => {
    const executableList = Object.values(state).filter(item => typeof item !== 'string');
    const process = executableList[processList.selected];
    stopProcess(process);
  });

  processList.key('o', () => {
    const currentScenarios = Object.values(state).filter(
      item => (typeof item !== 'string' && item.type === 'scenario'),
    );
    state = {
      ...(currentScenarios.reduce((acc, p) => ({
        ...acc,
        [p.id]: {
          ...p,
          status: state[p.id] ? state[p.id].status : 'stopped',
        },
      }), state)),
      scenariosStatus: 'open',
    };
    const executableList = Object.values(state).filter(item => typeof item !== 'string');
    processList.setItems(executableList.map(p => renderProcess(p)));
    screen.render();
  });

  processList.key('c', () => {
    const currentProcesses = Object.values(state).filter(
      item => (typeof item !== 'string' && item.type === 'process'),
    );
    state = {
      ...(currentProcesses.reduce((acc, p) => ({
        ...acc,
        [p.id]: {
          ...p,
          status: state[p.id] ? state[p.id].status : 'stopped',
        },
      }), state)),
      scenariosStatus: 'closed',
    };
    processList.setItems(currentProcesses.map(p => renderProcess(p)));
    screen.render();
  });

  return ({
    render,
    setProcessStatus,
    showProcessLogs,

    runAll() {
      processes
        .forEach(
          p => (
            p.active ? runProcess(p) : renderProcess(p)
          ),
        );
    },

    stopAll() {
      processes
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
