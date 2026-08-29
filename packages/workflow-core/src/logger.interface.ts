/**
 * Abstract logger interface for framework-independent logging.
 *
 * The API app provides a NestJS Logger adapter.
 * The code generator can provide a console-based adapter.
 */
export interface Logger {
  log(message: string): void;
  error(message: string, stack?: string): void;
  warn(message: string): void;
}

/**
 * A no-op logger for testing and environments where logging is not needed.
 */
export const noopLogger: Logger = {
  log: () => {},
  error: () => {},
  warn: () => {},
};
