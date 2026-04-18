import { EventEmitter } from 'eventemitter3';

/**
 * Modern structured logger with levels and context support
 */
export interface LoggerOptions {
  name: string;
  level?: 'debug' | 'info' | 'warn' | 'error';
  format?: 'json' | 'text';
  includeTimestamp?: boolean;
}

export class Logger {
  private readonly name: string;
  private readonly level: number;
  private readonly format: 'json' | 'text';
  private readonly includeTimestamp: boolean;

  private static LEVELS = {
    debug: 0,
    info: 1,
    warn: 2,
    error: 3,
  };

  constructor(options: LoggerOptions) {
    this.name = options.name;
    this.level = Logger.LEVELS[options.level || 'info'];
    this.format = options.format || 'text';
    this.includeTimestamp = options.includeTimestamp ?? true;
  }

  debug(message: string, ...args: any[]): void {
    if (this.level <= Logger.LEVELS.debug) {
      this.log('DEBUG', message, args);
    }
  }

  info(message: string, ...args: any[]): void {
    if (this.level <= Logger.LEVELS.info) {
      this.log('INFO', message, args);
    }
  }

  warn(message: string, ...args: any[]): void {
    if (this.level <= Logger.LEVELS.warn) {
      this.log('WARN', message, args);
    }
  }

  error(message: string, ...args: any[]): void {
    if (this.level <= Logger.LEVELS.error) {
      this.log('ERROR', message, args);
    }
  }

  private log(level: string, message: string, args: any[]): void {
    const timestamp = this.includeTimestamp ? new Date().toISOString() : '';
    
    if (this.format === 'json') {
      const logEntry = {
        timestamp,
        level,
        logger: this.name,
        message,
        ...(args.length > 0 && { metadata: args }),
      };
      console.log(JSON.stringify(logEntry));
    } else {
      const prefix = timestamp ? `[${timestamp}]` : '';
      const levelStr = `[${level}]`;
      const loggerName = `[${this.name}]`;
      
      if (args.length > 0) {
        console.log(`${prefix}${levelStr}${loggerName} ${message}`, ...args);
      } else {
        console.log(`${prefix}${levelStr}${loggerName} ${message}`);
      }
    }
  }
}

/**
 * Create a logger instance
 */
export function createLogger(name: string, options?: Partial<LoggerOptions>): Logger {
  return new Logger({ name, ...options });
}
