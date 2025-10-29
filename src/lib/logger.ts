/**
 * Client-side Logger Utility
 * Logs errors and events to the console and optionally to a remote server
 */

export enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error',
}

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  data?: any;
  error?: Error;
  context?: {
    url?: string;
    userAgent?: string;
    component?: string;
  };
}

class Logger {
  private logToConsole(entry: LogEntry): void {
    const { level, message, data, error } = entry;
    const timestamp = new Date(entry.timestamp).toISOString();
    const logMessage = `[${timestamp}] [${level.toUpperCase()}] ${message}`;

    switch (level) {
      case LogLevel.DEBUG:
        console.debug(logMessage, data, error);
        break;
      case LogLevel.INFO:
        console.info(logMessage, data);
        break;
      case LogLevel.WARN:
        console.warn(logMessage, data, error);
        break;
      case LogLevel.ERROR:
        console.error(logMessage, data, error);
        break;
    }
  }

  private async logToServer(entry: LogEntry): Promise<void> {
    // Only log errors to server in production
    if (process.env.NODE_ENV !== 'production' || entry.level !== LogLevel.ERROR) {
      return;
    }

    try {
      // Send error to backend logging endpoint
      await fetch('/api/log', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(entry),
      });
    } catch (error) {
      // Silently fail - don't want logging errors to break the app
      console.warn('Failed to send log to server:', error);
    }
  }

  private createLogEntry(
    level: LogLevel,
    message: string,
    data?: any,
    error?: Error
  ): LogEntry {
    return {
      level,
      message,
      timestamp: new Date().toISOString(),
      data,
      error: error ? {
        name: error.name,
        message: error.message,
        stack: error.stack,
      } as any : undefined,
      context: {
        url: typeof window !== 'undefined' ? window.location.href : undefined,
        userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
      },
    };
  }

  private log(level: LogLevel, message: string, data?: any, error?: Error): void {
    const entry = this.createLogEntry(level, message, data, error);
    this.logToConsole(entry);
    this.logToServer(entry);
  }

  debug(message: string, data?: any): void {
    this.log(LogLevel.DEBUG, message, data);
  }

  info(message: string, data?: any): void {
    this.log(LogLevel.INFO, message, data);
  }

  warn(message: string, data?: any, error?: Error): void {
    this.log(LogLevel.WARN, message, data, error);
  }

  error(message: string, error?: Error, data?: any): void {
    this.log(LogLevel.ERROR, message, data, error);
  }

  /**
   * Log an error with component context
   */
  errorWithContext(
    message: string,
    error: Error,
    component: string,
    data?: any
  ): void {
    const entry = this.createLogEntry(LogLevel.ERROR, message, data, error);
    entry.context = {
      ...entry.context,
      component,
    };
    this.logToConsole(entry);
    this.logToServer(entry);
  }
}

// Export singleton instance
export const logger = new Logger();
