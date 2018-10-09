import winston from 'winston';
import path from 'path';
import fs from 'fs';

const getFilePath = m => m.filename.split(path.sep).slice(-2).join(path.sep);

const dirLog = path.join(process.cwd(), 'logs');

if (!fs.existsSync(dirLog)) {
  fs.mkdirSync(dirLog);
}

const exFilePath = path.join(dirLog, 'exception.log');
const appFilePath = path.join(dirLog, 'application.log');
const logMaxSize = 5242880; // 5mb

// Logging Levels
// { error: 0, warn: 1, info: 2, verbose: 3, debug: 4, silly: 5 }

export default function logger(module) {
  return winston.createLogger({
    transports: [
      new winston.transports.File({
        name: 'file.error',
        level: 'error',
        label: getFilePath(module),
        filename: exFilePath,
        handleExceptions: true,
        humanReadableUnhandledException: true,
        json: false,
        maxSize: logMaxSize,
        colorize: false
      }),
      new winston.transports.File({
        name: 'file.info',
        level: 'info',
        label: getFilePath(module),
        filename: appFilePath,
        handleExceptions: false,
        json: false,
        maxSize: logMaxSize,
        colorize: false
      }),
      new winston.transports.Console({
        level: 'debug',
        label: getFilePath(module),
        handleExceptions: true,
        humanReadableUnhandledException: true,
        json: false,
        colorize: true,
        timestamp: true
      })
    ],
    exitOnError: false
  });
}


export const appLogger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    //
    // - Write to all logs with level `info` and below to `combined.log`
    // - Write all logs error (and below) to `error.log`.
    //
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});

//
// If we're not in production then log to the `console` with the format:
// `${info.level}: ${info.message} JSON.stringify({ ...rest }) `
//
// if (process.env.NODE_ENV !== 'production') {
appLogger.add(new winston.transports.Console({
  format: winston.format.combine(
    winston.format.colorize({ all: true }),
    winston.format.splat(),
    winston.format.simple(),
  )
}));
// }
