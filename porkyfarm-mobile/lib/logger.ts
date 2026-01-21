/**
 * Logger conditionnel pour production
 * Logs uniquement en développement, erreurs toujours visibles
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error'

const isDev = __DEV__

class Logger {
  private formatMessage(level: LogLevel, message: string): string {
    const timestamp = new Date().toISOString().split('T')[1].split('.')[0]
    return `[${timestamp}][${level.toUpperCase()}] ${message}`
  }

  debug(message: string, ...args: any[]) {
    if (isDev) {
      console.log(this.formatMessage('debug', message), ...args)
    }
  }

  info(message: string, ...args: any[]) {
    if (isDev) {
      console.log(this.formatMessage('info', message), ...args)
    }
  }

  warn(message: string, ...args: any[]) {
    console.warn(this.formatMessage('warn', message), ...args)
  }

  error(message: string, error?: Error | unknown, ...args: any[]) {
    console.error(this.formatMessage('error', message), error, ...args)
    
    // En production, envoyer à Sentry
    if (!isDev && error instanceof Error) {
      // Sentry.captureException(error)
    }
  }
}

export const logger = new Logger()
export default logger

