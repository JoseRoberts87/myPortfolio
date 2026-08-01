/** Tests for the shared AI error helpers (issues #209 / #211). */
import {
  apiErrorMessage,
  networkErrorMessage,
  timeoutSignal,
  STREAM_LOST_NOTICE,
} from '@/lib/aiErrors';

describe('apiErrorMessage', () => {
  it('prefers the error-middleware envelope ({error: {message}})', () => {
    expect(
      apiErrorMessage({ error: { message: 'resting' }, detail: 'ignored' }, 'fb'),
    ).toBe('resting');
  });

  it('falls back to FastAPI detail when there is no envelope', () => {
    expect(apiErrorMessage({ detail: 'validation says no' }, 'fb')).toBe(
      'validation says no',
    );
  });

  it('falls back to the provided message for empty/absent/malformed payloads', () => {
    expect(apiErrorMessage(undefined, 'fb')).toBe('fb');
    expect(apiErrorMessage(null, 'fb')).toBe('fb');
    expect(apiErrorMessage({}, 'fb')).toBe('fb');
    expect(apiErrorMessage({ error: { message: '   ' }, detail: '' }, 'fb')).toBe('fb');
    expect(apiErrorMessage({ error: { message: 42 }, detail: { nested: true } }, 'fb')).toBe('fb');
  });
});

describe('networkErrorMessage', () => {
  it('names the feature and points to the contact form', () => {
    const msg = networkErrorMessage('assistant');
    expect(msg).toMatch(/The assistant is temporarily unavailable/);
    expect(msg).toMatch(/contact form/);
  });

  it('has no developer hint outside development (NODE_ENV=test here)', () => {
    expect(networkErrorMessage('agent')).not.toMatch(/port 8000/);
  });
});

describe('timeoutSignal', () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  it('aborts after the given delay', () => {
    const { signal } = timeoutSignal(20_000);
    expect(signal.aborted).toBe(false);
    jest.advanceTimersByTime(20_000);
    expect(signal.aborted).toBe(true);
  });

  it('never aborts once cleared (headers arrived — long streams stay alive)', () => {
    const { signal, clear } = timeoutSignal(20_000);
    clear();
    jest.advanceTimersByTime(60_000);
    expect(signal.aborted).toBe(false);
  });
});

describe('STREAM_LOST_NOTICE', () => {
  it('is phrased as a non-destructive notice', () => {
    expect(STREAM_LOST_NOTICE).toMatch(/may be incomplete/i);
  });
});
