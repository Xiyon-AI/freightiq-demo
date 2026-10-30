/**
 * Logger utility for consistent logging across the application
 * In production, logs should be sent to an error tracking service (e.g., Sentry)
 */

const isDevelopment = process.env.NODE_ENV === 'development';

type LogLevel = 'info' | 'warn' | 'error' | 'debug';

interface LogContext {
  [key: string]: unknown;
}

class Logger {
  private log(level: LogLevel, message: string, context?: LogContext | Error) {
    if (!isDevelopment && level === 'debug') {
      return; // Skip debug logs in production
    }

    const timestamp = new Date().toISOString();
    const prefix = `[${timestamp}] [${level.toUpperCase()}]`;

    if (context instanceof Error) {
      console[level === 'error' ? 'error' : 'log'](prefix, message, context);
      
      // In production, send to error tracking service
      if (!isDevelopment && level === 'error') {
        this.sendToErrorTracking(message, context);
      }
    } else if (context) {
      console[level === 'error' ? 'error' : 'log'](prefix, message, context);
    } else {
      console[level === 'error' ? 'error' : 'log'](prefix, message);
    }
  }

  private sendToErrorTracking(_message: string, _error: Error) {
    // TODO: Integrate with error tracking service (Sentry, LogRocket, etc.)
    // Example:
    // Sentry.captureException(_error, { extra: { message: _message } });
  }

  /**
   * Log informational messages
   */
  info(message: string, context?: LogContext) {
    this.log('info', message, context);
  }

  /**
   * Log warning messages
   */
  warn(message: string, context?: LogContext) {
    this.log('warn', message, context);
  }

  /**
   * Log error messages
   */
  error(message: string, error?: Error | LogContext) {
    this.log('error', message, error);
  }

  /**
   * Log debug messages (only in development)
   */
  debug(message: string, context?: LogContext) {
    this.log('debug', message, context);
  }

  /**
   * Log API request/response for debugging
   */
  api(method: string, url: string, status?: number, duration?: number) {
    if (isDevelopment) {
      this.debug(`API ${method} ${url}`, { status, duration });
    }
  }

  /**
   * Log database queries for debugging
   */
  db(query: string, duration?: number) {
    if (isDevelopment) {
      this.debug(`DB Query: ${query}`, { duration });
    }
  }
}

// Export singleton instance
export const logger = new Logger();

// Export for testing
export { Logger };
