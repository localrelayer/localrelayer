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
  let state = {
    selectedForLogs: '',
    scenariosStatus: 'closed',
    ...(allItems.reduce((acc, p) => ({
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

  function render() {
    const executableList = state.scenariosStatus === 'opened'
      ? Object.values(state).filter(
        item => typeof item !== 'string',
      )
      : Object.values(state).filter(
        item => (
          typeof item !== 'string' && (item.type === 'process' || item.type === 'test')
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
    scenariosLogger.setLabel(`Output - ${process.name}`);
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

  function showScenarios() {
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
      scenariosStatus: 'opened',
    };
    const executableList = Object.values(state).filter(item => typeof item !== 'string');
    processList.setItems(executableList.map(p => renderProcess(p)));
    screen.render();
  }

  function hideScenarios() {
    const currentProcesses = Object.values(state).filter(
      item => (
        typeof item !== 'string' && (item.type === 'process' || item.type === 'test')
      ),
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
  }

  function showProcessLogs(process) {
    onShowLogs(process);
    state.selectedForLogs = process.id;

    redisSub.unsubscribe();
    redisSub.subscribe(`logs-${process.id}`);
    render();
  }
  processList.on('select item', () => {
    const executableList = Object.values(state).filter(item => typeof item !== 'string');
    switch (executableList[processList.selected].type) {
      case 'scenario': {
        const scenarioCommands = Object.assign({}, commands);
        scenarioCommands.Enter = 'Show scenario logs';
        scenarioCommands.r = 'Run scenario';
        scenarioCommands.s = 'Stop Scenario';
        footer.setContent(Object.keys(scenarioCommands).map(key => (
          `{white-bg}{black-fg}${key}{/black-fg}{/white-bg} ${scenarioCommands[key]}`
        )).join('  '));
        break;
      }
      case 'test': {
        const scenarioCommands = Object.assign({}, commands);
        scenarioCommands.Enter = 'Show test logs';
        scenarioCommands.r = 'Run test';
        scenarioCommands.s = 'Stop test';
        footer.setContent(Object.keys(scenarioCommands).map(key => (
          `{white-bg}{black-fg}${key}{/black-fg}{/white-bg} ${scenarioCommands[key]}`
        )).join('  '));
        break;
      }
      default: {
        footer.setContent(Object.keys(commands).map(key => (
          `{white-bg}{black-fg}${key}{/black-fg}{/white-bg} ${commands[key]}`
        )).join('  '));
        break;
      }
    }
  });
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

  processList.key('t', () => {
    switch (state.scenariosStatus) {
      case 'closed': {
        showScenarios();
        break;
      }
      case 'opened': {
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
    showScenarios,

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
