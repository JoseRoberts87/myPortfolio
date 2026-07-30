import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';

jest.mock('@/lib/logger', () => ({ logger: { error: jest.fn() } }));
import { logger } from '@/lib/logger';
import ErrorBoundary from '@/app/error';

describe('app/error.tsx (route error boundary)', () => {
  beforeEach(() => jest.clearAllMocks());

  it('renders the fallback UI with both actions', () => {
    render(<ErrorBoundary error={new Error('boom')} reset={jest.fn()} />);
    expect(screen.getByRole('heading', { name: /something went wrong/i })).toBeInTheDocument();
    expect(screen.getByText(/something unexpected happened/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /go home/i })).toBeInTheDocument();
  });

  it('logs the error (with digest) on mount', () => {
    const error = Object.assign(new Error('boom'), { digest: 'digest-123' });
    render(<ErrorBoundary error={error} reset={jest.fn()} />);
    expect(logger.error).toHaveBeenCalledWith('Application error occurred', error, {
      digest: 'digest-123',
    });
  });

  it('calls reset when "Try Again" is clicked', () => {
    const reset = jest.fn();
    render(<ErrorBoundary error={new Error('x')} reset={reset} />);
    fireEvent.click(screen.getByRole('button', { name: /try again/i }));
    expect(reset).toHaveBeenCalledTimes(1);
  });

  it('navigates home when "Go Home" is clicked', () => {
    const original = window.location;
    // jsdom's window.location is read-only; swap in a writable stub.
    delete (window as unknown as { location?: Location }).location;
    (window as unknown as { location: { href: string } }).location = { href: '' };

    render(<ErrorBoundary error={new Error('x')} reset={jest.fn()} />);
    fireEvent.click(screen.getByRole('button', { name: /go home/i }));
    expect(window.location.href).toBe('/');

    (window as unknown as { location: Location }).location = original;
  });
});
