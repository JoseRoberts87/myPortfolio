import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ErrorBoundary, withErrorBoundary } from '@/components/ErrorBoundary';
import { logger } from '@/lib/logger';

// The boundary reports caught errors through the shared logger's
// errorWithContext(); mock it so we can assert on the call without hitting the
// real console/remote transport.
jest.mock('@/lib/logger', () => ({
  logger: { error: jest.fn(), errorWithContext: jest.fn() },
}));

// Throws during render to trip the boundary.
function Boom(): React.ReactElement {
  throw new Error('kaboom');
}

describe('ErrorBoundary', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // React re-logs caught render errors to console.error; silence that noise so
    // the test output stays clean. Restored in afterEach.
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('renders its children when nothing throws', () => {
    render(
      <ErrorBoundary>
        <div>safe content</div>
      </ErrorBoundary>
    );

    expect(screen.getByText('safe content')).toBeInTheDocument();
  });

  it('renders the default fallback UI and logs when a child throws', () => {
    render(
      <ErrorBoundary>
        <Boom />
      </ErrorBoundary>
    );

    // Default fallback copy from the component.
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /try again/i })
    ).toBeInTheDocument();

    // The error was reported through the logger with component context.
    expect(logger.errorWithContext).toHaveBeenCalledWith(
      'React Error Boundary caught an error',
      expect.any(Error),
      expect.any(String),
      expect.any(Object)
    );
  });

  it('renders a custom fallback when the fallback prop is provided', () => {
    render(
      <ErrorBoundary fallback={<div>custom fallback</div>}>
        <Boom />
      </ErrorBoundary>
    );

    expect(screen.getByText('custom fallback')).toBeInTheDocument();
    // The default fallback must not also render.
    expect(screen.queryByText('Something went wrong')).not.toBeInTheDocument();
  });

  it('recovers via the "Try Again" button once the child stops throwing', () => {
    let shouldThrow = true;
    function MaybeBoom(): React.ReactElement {
      if (shouldThrow) {
        throw new Error('kaboom');
      }
      return <div>recovered content</div>;
    }

    render(
      <ErrorBoundary>
        <MaybeBoom />
      </ErrorBoundary>
    );

    expect(screen.getByText('Something went wrong')).toBeInTheDocument();

    // Stop throwing, then reset the boundary through its retry button.
    shouldThrow = false;
    fireEvent.click(screen.getByRole('button', { name: /try again/i }));

    expect(screen.getByText('recovered content')).toBeInTheDocument();
    expect(screen.queryByText('Something went wrong')).not.toBeInTheDocument();
  });

  it('withErrorBoundary renders the fallback when the wrapped component throws', () => {
    const Wrapped = withErrorBoundary(Boom);

    render(<Wrapped />);

    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    expect(logger.errorWithContext).toHaveBeenCalled();
  });

  it('withErrorBoundary forwards a custom fallback argument', () => {
    const Wrapped = withErrorBoundary(Boom, <div>hoc fallback</div>);

    render(<Wrapped />);

    expect(screen.getByText('hoc fallback')).toBeInTheDocument();
    expect(screen.queryByText('Something went wrong')).not.toBeInTheDocument();
  });
});
