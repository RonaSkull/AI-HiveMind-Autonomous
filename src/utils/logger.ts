import winston from 'winston';
import 'winston-daily-rotate-file';
import path from 'path';
import config from '@config/config';

const { combine, timestamp, printf, colorize } = winston.format;

const logFormat = printf(({ level, message, timestamp, ...meta }) => {
  const metaString = Object.keys(meta).length ? `\n${JSON.stringify(meta, null, 2)}` : '';
  return `[${timestamp}] ${level}: ${message}${metaString}`;
});

const transports = [
  new winston.transports.Console({
    format: combine(colorize({ all: true }), timestamp(), logFormat),
    level: config.agent.logLevel,
  }),
];

if (process.env.NODE_ENV !== 'test') {
  transports.push(
    new winston.transports.DailyRotateFile({
      filename: path.join('logs', 'application-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      maxSize: '20m',
      maxFiles: '14d',
      format: combine(timestamp(), logFormat),
      level: 'debug',
    })
  );
}

export const createLogger = (context: string) => {
  return winston.createLogger({
    level: config.agent.logLevel,
    defaultMeta: { context },
    transports,
    exceptionHandlers: [
      new winston.transports.File({ filename: 'logs/exceptions.log' }),
    ],
    exitOnError: false,
  });
};

export const logger = createLogger('App');
