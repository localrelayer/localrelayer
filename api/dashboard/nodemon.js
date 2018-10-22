import nodemon from 'nodemon';

nodemon({
  script: './dashboard/index.js',
  ext: 'js json',
  stdin: false,
});

nodemon.on('crash', () => {
  process.exit();
});
