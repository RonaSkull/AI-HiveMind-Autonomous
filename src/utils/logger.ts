import winston, { format } from 'winston';
const { combine, timestamp, printf, colorize } = format;

const logFormat = printf(({ level, message, timestamp, context, ...meta }) => {
  const metaString = Object.keys(meta).length 
    ? `\n${JSON.stringify(meta, null, 2)}` 
    : '';
  return `[${timestamp}] [${context || 'App'}] ${level}: ${message}${metaString}`;
});

const logger = winston.createLogger({
  level: 'debug',
  format: combine(
    colorize(),
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    logFormat
  ),
  transports: [
    new winston.transports.Console()
  ]
});

export const createLogger = (context: string) => {
  return winston.createLogger({
    level: 'debug',
    defaultMeta: { context },
    format: combine(
      colorize(),
      timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
      logFormat
    ),
    transports: [
      new winston.transports.Console()
    ]
  });
};

export { logger };
