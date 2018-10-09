import pkg from '../package.json';
import config from './config';
import _log from './utils/logger';
import { app } from './server';


const log = _log(module);

/* eslint-disable */
const banner = `${pkg.description} @version ${pkg.version}`
/* eslint-enable */

log.debug(banner);
(async () => {
  app.listen(config.port, () => {
    log.debug(`App started on port ${config.port}`);
  });
})();
