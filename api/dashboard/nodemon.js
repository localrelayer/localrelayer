import nodemon from 'nodemon';

nodemon({
  script: './dashboard/index.js',
  ext: 'js json',
  stdin: false,
  delay: 500,
});

nodemon.on('crash', () => {
  process.exit();
});
