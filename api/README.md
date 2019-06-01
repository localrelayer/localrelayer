# Local Relayer API

## Usage

#### Installation

##### Before you start
  + [node](https://nodejs.org/) version should be >= 8 `node -v`
  + [npm](https://www.npmjs.com/) version should be >= 5 `npm -v`

#### Installation

```js
  npm i
```

## Dashboard
The dashboard is an execution environment implemented as a console application. 
The main purpose of the dashboard is the automated execution processes, scenarios and tests.
In order to run dashboard execute next commands:
```
npm run dashboard
```
It contains three elements:
- **Output** is simply consoled output of currently executing a process (on the left)
- **Logs** show structured logs of the current process
                      (current process mark with *) which are taken from redis (on the top right)
- **Execution list** contains all available processes and scenarios 
                                          to execute (on the bottom right)

At the footer are displayed available actions for each executing list item. E.g. **r** - run the process, **s** - stop 
the process, **t** - show/hide scenarios, **Enter** - choose process which logs will be shown in Logs box etc.

In order to add your own process, scenario or test to Execution list, you have to insert it into a suitable array in
**dashboard/index.js** (i.e. processes, scenarios or tests array). It's possible to select processes that will be execute
automatically after dashboard starting, for this reason, add process id in **dashboard/.config.js**, pay attention that 
**.config.js** only stores locally and should never be pushed to remote.

