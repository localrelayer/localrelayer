export function dashboardFactory({
  screen,
  processList,
  redisSub,
  processes,
  onShowLogs,
}) {
  const state = {
    selectedForLogs: null,
    ...(processes.reduce((acc, p) => ({
      ...acc,
      [p.id]: {
        ...p,
        status: 'stopped',
      },
    }), {})),
  };
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
    const spacesCount = 30 - process.name.length - (isSelectedForLogs ? 1 : 0);
    return [
      process.name,
      Array(spacesCount).fill().join(' '),
      isSelectedForLogs ? '*' : '',
      `${getStatus(process.id)}`.toString(),
    ].join(' ');
  }

  function render() {
    processList.setItems(
      processes
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
    const process = processes[processList.selected];
    showProcessLogs(process);
  });

  processList.key('r', () => {
    const process = processes[processList.selected];
    runProcess(process);
  });

  processList.key('s', () => {
    const process = processes[processList.selected];
    stopProcess(process);
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
