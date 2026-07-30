/**
 * Tests for the client-side leveled logger singleton (`src/lib/logger.ts`).
 *
 * Covers:
 *  - LogLevel enum values
 *  - console routing per level (debug/info/warn/error)
 *  - the `error(message, error, data)` argument ordering / forwarding
 *  - errorWithContext logging at error level
 *  - logToServer gating: only POSTs to /api/log when NODE_ENV === 'production'
 *    AND the level is ERROR, and it silently swallows fetch failures.
 */

import { logger, LogLevel } from '@/lib/logger';

// Snapshot the ambient NODE_ENV so production-toggling tests can always restore it,
// keeping other suites unaffected regardless of which test set it last.
const ORIGINAL_NODE_ENV = process.env.NODE_ENV;

// `logToServer` is async and fire-and-forget from `log()`, so give the
// microtask/macrotask queues a chance to settle before asserting on fetch.
const flush = () => new Promise((resolve) => setTimeout(resolve, 0));

beforeEach(() => {
  jest.spyOn(console, 'debug').mockImplementation(() => {});
  jest.spyOn(console, 'info').mockImplementation(() => {});
  jest.spyOn(console, 'warn').mockImplementation(() => {});
  jest.spyOn(console, 'error').mockImplementation(() => {});
  (global.fetch as jest.Mock) = jest.fn().mockResolvedValue({ ok: true });
});

afterEach(() => {
  jest.restoreAllMocks();
  // Always restore NODE_ENV so the production toggle never leaks into other suites.
  (process.env as any).NODE_ENV = ORIGINAL_NODE_ENV;
});

describe('logger', () => {
  describe('LogLevel enum', () => {
    it('exposes the expected string values', () => {
      expect(LogLevel.DEBUG).toBe('debug');
      expect(LogLevel.INFO).toBe('info');
      expect(LogLevel.WARN).toBe('warn');
      expect(LogLevel.ERROR).toBe('error');
    });
  });

  describe('console level routing', () => {
    it('debug() routes to console.debug with a [DEBUG] tagged message', () => {
      logger.debug('m');

      expect(console.debug).toHaveBeenCalledTimes(1);
      const firstArg = (console.debug as jest.Mock).mock.calls[0][0];
      expect(typeof firstArg).toBe('string');
      expect(firstArg).toMatch(/\[DEBUG\] m/);
    });

    it('info() routes to console.info with an [INFO] tagged message', () => {
      logger.info('m');

      expect(console.info).toHaveBeenCalledTimes(1);
      const firstArg = (console.info as jest.Mock).mock.calls[0][0];
      expect(typeof firstArg).toBe('string');
      expect(firstArg).toMatch(/\[INFO\] m/);
    });

    it('warn() routes to console.warn with a [WARN] tagged message', () => {
      logger.warn('m');

      expect(console.warn).toHaveBeenCalledTimes(1);
      const firstArg = (console.warn as jest.Mock).mock.calls[0][0];
      expect(typeof firstArg).toBe('string');
      expect(firstArg).toMatch(/\[WARN\] m/);
    });

    it('error() routes to console.error with an [ERROR] tagged message', () => {
      logger.error('m');

      expect(console.error).toHaveBeenCalledTimes(1);
      const firstArg = (console.error as jest.Mock).mock.calls[0][0];
      expect(typeof firstArg).toBe('string');
      expect(firstArg).toMatch(/\[ERROR\] m/);
    });
  });

  describe('error() signature: (message, error, data)', () => {
    it('forwards the error and data object to console.error', () => {
      const err = new Error('x');
      const data = { id: 1 };

      logger.error('boom', err, data);

      expect(console.error).toHaveBeenCalledTimes(1);
      // logToConsole calls: console.error(logMessage, data, error)
      const callArgs = (console.error as jest.Mock).mock.calls[0];
      expect(callArgs[0]).toMatch(/\[ERROR\] boom/);
      // data object is forwarded verbatim as the second arg.
      expect(callArgs[1]).toEqual(data);
      // The error is normalized to a plain object but still carries its message.
      expect(callArgs[2]).toEqual(expect.objectContaining({ message: 'x' }));
    });
  });

  describe('errorWithContext()', () => {
    it('logs at error level with the message and does not throw', () => {
      expect(() =>
        logger.errorWithContext('m', new Error('x'), 'MyComponent')
      ).not.toThrow();

      expect(console.error).toHaveBeenCalledTimes(1);
      const firstArg = (console.error as jest.Mock).mock.calls[0][0];
      expect(firstArg).toMatch(/\[ERROR\] m/);
    });
  });

  describe('logToServer gating', () => {
    it('does NOT POST to /api/log outside production', async () => {
      (process.env as any).NODE_ENV = 'development';

      logger.error('m', new Error('x'));
      await flush();

      expect(global.fetch).not.toHaveBeenCalled();
    });

    it('POSTs the error entry to /api/log in production', async () => {
      (process.env as any).NODE_ENV = 'production';

      logger.error('m', new Error('x'));
      await flush();

      expect(global.fetch).toHaveBeenCalledTimes(1);
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/log',
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: expect.stringContaining('"message":"m"'),
        })
      );

      // Body is the JSON-serialized log entry.
      const [, options] = (global.fetch as jest.Mock).mock.calls[0];
      const parsed = JSON.parse(options.body);
      expect(parsed.level).toBe('error');
      expect(parsed.message).toBe('m');
    });

    it('does NOT POST non-error logs in production', async () => {
      (process.env as any).NODE_ENV = 'production';

      logger.info('m');
      await flush();

      expect(global.fetch).not.toHaveBeenCalled();
    });

    it('swallows fetch failures and warns instead of throwing', async () => {
      (process.env as any).NODE_ENV = 'production';
      (global.fetch as jest.Mock).mockRejectedValue(new Error('network down'));

      expect(() => logger.error('m', new Error('x'))).not.toThrow();
      await flush();

      expect(global.fetch).toHaveBeenCalledTimes(1);
      // The catch branch logs a warning rather than propagating.
      expect(console.warn).toHaveBeenCalled();
      const warnFirstArg = (console.warn as jest.Mock).mock.calls[0][0];
      expect(warnFirstArg).toContain('Failed to send log to server');
    });
  });
});
