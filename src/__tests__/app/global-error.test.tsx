import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';

jest.mock('@/lib/logger', () => ({ logger: { error: jest.fn() } }));
import { logger } from '@/lib/logger';
import GlobalError from '@/app/global-error';

describe('app/global-error.tsx (root error boundary)', () => {
  let consoleErr: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    // global-error renders its own <html><body>, which React warns about when
    // nested in the RTL container — silence just that noise for these tests.
    consoleErr = jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => consoleErr.mockRestore());

  it('renders the critical-error fallback with both actions', () => {
    render(<GlobalError error={new Error('boom')} reset={jest.fn()} />);
    expect(screen.getByRole('heading', { name: /application error/i })).toBeInTheDocument();
    expect(screen.getByText(/a critical error occurred/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /reload page/i })).toBeInTheDocument();
  });

  it('logs the error on mount', () => {
    const error = Object.assign(new Error('boom'), { digest: 'd1' });
    render(<GlobalError error={error} reset={jest.fn()} />);
    expect(logger.error).toHaveBeenCalledWith('Global application error occurred', error, {
      digest: 'd1',
    });
  });

  it('calls reset when "Try Again" is clicked', () => {
    const reset = jest.fn();
    render(<GlobalError error={new Error('x')} reset={reset} />);
    fireEvent.click(screen.getByRole('button', { name: /try again/i }));
    expect(reset).toHaveBeenCalledTimes(1);
  });

  it('reloads the page when "Reload Page" is clicked', () => {
    const original = window.location;
    delete (window as unknown as { location?: Location }).location;
    (window as unknown as { location: { reload: jest.Mock } }).location = { reload: jest.fn() };

    render(<GlobalError error={new Error('x')} reset={jest.fn()} />);
    fireEvent.click(screen.getByRole('button', { name: /reload page/i }));
    expect(window.location.reload).toHaveBeenCalledTimes(1);

    (window as unknown as { location: Location }).location = original;
  });
});
