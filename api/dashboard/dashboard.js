export function dashboardFactory({
  screen,
  processList,
  scenariosLogger,
  allItems,
  footer,
  commands,
  redisSub,
  onShowLogs,
}) {
  const state = {
    selectedForLogs: '',
    displayTestsAndScenariosStatus: false,
    processes: (
      allItems.reduce((acc, p) => ({
        ...acc,
        [p.id]: {
          ...p,
          status: 'stopped',
        },
      }), {})
    ),
  };
  processList.focus();

  function getStatus(processId) {
    const { status } = state.processes[processId];
    switch (status) {
      case 'stopped': return `{grey-fg}${status}{/grey-fg}`;
      case 'starting': return `{yellow-fg}${status}{/yellow-fg}`;
      case 'stopping': return `{red-fg}${status}{/red-fg}`;
      case 'running': return `{green-fg}${status}{/green-fg}`;
      default:
        return null;
    }
  }

  function renderProcess(process) {
    const isSelectedForLogs = state.selectedForLogs === process.id;
    const spacesCount = 50 - process.name.length - (isSelectedForLogs ? 1 : 0);
    let coloredName;
    switch (process.type) {
      case 'scenario': {
        coloredName = `{#00FFFF-fg}${process.name}{/#00FFFF-fg}`;
        break;
      }
      case 'test': {
        coloredName = `{#DAA520-fg}${process.name}{/#DAA520-fg}`;
        break;
      }
      default: {
        coloredName = `{#2E8B57-fg}${process.name}{/#2E8B57-fg}`;
        break;
      }
    }
    return [
      coloredName,
      Array(spacesCount).fill().join(' '),
      isSelectedForLogs ? '{#FFA500-fg}*{/#FFA500-fg}' : '',
      `${getStatus(process.id)}`.toString(),
    ].join(' ');
  }

  function renderFooter() {
    const executableList = Object.values(state.processes);
    const selectedProcess = executableList[processList.selected];
    const {
      Enter,
      ...excludeEnter
    } = commands;
    const adaptedCommands = selectedProcess.type === 'process'
      ? {
        ...commands,
        r: `Run ${selectedProcess.type}`,
        s: `Stop ${selectedProcess.type}`,
      }
      : {
        ...excludeEnter,
        r: `Run ${selectedProcess.type}`,
        s: `Stop ${selectedProcess.type}`,
      };
    footer.setContent(Object.keys(adaptedCommands).map(key => (
      `{white-bg}{black-fg}${key}{/black-fg}{/white-bg} ${adaptedCommands[key]}`
    )).join('  '));
  }

  function render() {
    const executableList = (
      Object.values(state.processes).filter(
        item => (
          item.type === 'process'
            ? true
            : state.displayTestsAndScenariosStatus
        ),
      )
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
    state.processes[processId].status = status;
    render();
  }

  function runProcess(process) {
    const { status } = state.processes[process.id];
    scenariosLogger.setLabel(`Output - ${process.name}`);
    if (status === 'stopped') {
      setProcessStatus(
        process.id,
        'starting',
      );
      state.processes[process.id].stop = process.run((child) => {
        setProcessStatus(
          process.id,
          'running',
        );
        if (process.type !== 'process') {
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

  function showTestsAndScenarios() {
    state.displayTestsAndScenariosStatus = true;
    render();
  }

  function hideScenarios() {
    state.displayTestsAndScenariosStatus = false;
    render();
  }

  function showProcessLogs(process) {
    onShowLogs(process);
    state.selectedForLogs = process.id;

    redisSub.unsubscribe();
    redisSub.subscribe(`logs-${process.id}`);
    render();
  }

  processList.on('select item', () => {
    renderFooter();
    screen.render();
  });

  processList.key('enter', () => {
    const executableList = Object.values(state.processes);
    const process = executableList[processList.selected];
    if (process.type === 'process') {
      showProcessLogs(process);
    }
  });

  processList.key('r', () => {
    const executableList = Object.values(state.processes);
    const process = executableList[processList.selected];
    runProcess(process);
  });

  processList.key('s', () => {
    const executableList = Object.values(state.processes);
    const process = executableList[processList.selected];
    stopProcess(process);
  });

  processList.key('t', () => {
    switch (state.displayTestsAndScenariosStatus) {
      case false: {
        showTestsAndScenarios();
        break;
      }
      case true: {
        hideScenarios();
        break;
      }
      default: break;
    }
  });

  return ({
    render,
    setProcessStatus,
    showProcessLogs,
    showTestsAndScenarios,

    runAll() {
      allItems
        .forEach(
          p => (
            p.active ? runProcess(p) : renderProcess(p)
          ),
        );
    },

    stopAll() {
      allItems
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
