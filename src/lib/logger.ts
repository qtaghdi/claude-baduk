type LogLevel = 'info' | 'warn' | 'error' | 'debug';

class Logger {
  private isDev = process.env.NODE_ENV !== 'production';

  private log(level: LogLevel, message: string, meta?: any): void {
    const timestamp = new Date().toISOString();
    const prefix = `[${timestamp}] [${level.toUpperCase()}]`;

    switch (level) {
      case 'error':
        console.error(prefix, message, meta || '');
        break;
      case 'warn':
        console.warn(prefix, message, meta || '');
        break;
      case 'debug':
        if (this.isDev) {
          console.log(prefix, message, meta || '');
        }
        break;
      case 'info':
      default:
        console.log(prefix, message, meta || '');
    }
  }

  info(message: string, meta?: any): void {
    this.log('info', message, meta);
  }

  warn(message: string, meta?: any): void {
    this.log('warn', message, meta);
  }

  error(message: string, meta?: any): void {
    this.log('error', message, meta);
  }

  debug(message: string, meta?: any): void {
    this.log('debug', message, meta);
  }
}

export const logger = new Logger();
