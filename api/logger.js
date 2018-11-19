import winston from 'winston';
import WinstonRedisTransport from 'winston-redis';
import path from 'path';
import fs from 'fs';

import {
  redisClient,
} from 'redisClient';


const loggerRedisClient = redisClient.duplicate();
const dirLog = path.join(process.cwd(), 'logs');
const logMaxSize = 5242880; // 5mb
if (!fs.existsSync(dirLog)) {
  fs.mkdirSync(dirLog);
}

export function createLogger(
  processName,
  level = 'silly',
  consoleTransport = false,
) {
  return winston.createLogger({
    level,
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.json(),
    ),
    transports: [
      new WinstonRedisTransport({
        redis: loggerRedisClient,
        channel: `logs-${processName}`,
        container: `logsContainer-${processName}`,
        length: 1000,
      }),
      new winston.transports.File({
        filename: path.join(dirLog, `${processName}.error.log`),
        level: 'error',
        maxSize: logMaxSize,
      }),
      new winston.transports.File({
        filename: path.join(dirLog, `${processName}.combined.log`),
        maxSize: logMaxSize,
        level,
      }),
      ...(consoleTransport ? [
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.colorize({ all: true }),
            winston.format.splat(),
            winston.format.simple(),
          ),
        }),
      ] : []),
    ],
  });
}
