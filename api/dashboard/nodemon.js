import nodemon from 'nodemon';

import dashboardConfig from './.config';

nodemon({
  script: './dashboard/index.js',
  ext: 'js json',
  stdin: false,
  delay: dashboardConfig.nodemonDelay,
});

nodemon.on('crash', () => {
  process.exit();
});
