import React from 'react';
import { render, screen, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ThemeProvider, useTheme } from '@/contexts/ThemeContext';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation((query) => ({
    matches: query === '(prefers-color-scheme: dark)',
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Test component that uses the theme hook
function TestComponent() {
  const { theme, toggleTheme } = useTheme();
  return (
    <div>
      <div data-testid="current-theme">{theme}</div>
      <button onClick={toggleTheme} data-testid="toggle-button">
        Toggle Theme
      </button>
    </div>
  );
}

describe('ThemeContext', () => {
  beforeEach(() => {
    localStorageMock.clear();
    document.documentElement.className = '';
  });

  it('should provide default theme as dark', () => {
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );

    // Initially renders with 'dark' before useEffect runs
    expect(screen.getByTestId('current-theme')).toBeInTheDocument();
  });

  it('should toggle theme from dark to light', () => {
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );

    const toggleButton = screen.getByTestId('toggle-button');
    const themeDisplay = screen.getByTestId('current-theme');

    act(() => {
      toggleButton.click();
    });

    // After toggle, should be 'light'
    expect(themeDisplay.textContent).toBe('light');
  });

  it('should toggle theme from light to dark', () => {
    // Set initial theme to light
    localStorageMock.setItem('theme', 'light');

    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );

    const toggleButton = screen.getByTestId('toggle-button');

    // Toggle once to go to dark
    act(() => {
      toggleButton.click();
    });

    const themeDisplay = screen.getByTestId('current-theme');
    expect(themeDisplay.textContent).toBe('dark');
  });

  it('should save theme to localStorage on toggle', () => {
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );

    const toggleButton = screen.getByTestId('toggle-button');

    act(() => {
      toggleButton.click();
    });

    expect(localStorageMock.getItem('theme')).toBe('light');
  });

  it('should update document class on toggle', () => {
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );

    const toggleButton = screen.getByTestId('toggle-button');

    // Initially dark
    act(() => {
      toggleButton.click();
    });

    // After toggling to light, dark class should be removed
    expect(document.documentElement.classList.contains('dark')).toBe(false);

    // Toggle back to dark
    act(() => {
      toggleButton.click();
    });

    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });

  it('should load theme from localStorage', () => {
    localStorageMock.setItem('theme', 'light');

    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );

    // Should eventually show light theme
    const themeDisplay = screen.getByTestId('current-theme');
    expect(themeDisplay).toBeInTheDocument();
  });

  it('should fall back to system preference when no saved theme', () => {
    // matchMedia is mocked to return dark preference
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );

    expect(screen.getByTestId('current-theme')).toBeInTheDocument();
  });

  it('should throw error when useTheme is used outside ThemeProvider', () => {
    // Suppress console.error for this test
    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});

    function ComponentWithoutProvider() {
      try {
        useTheme();
        return <div>Should not render</div>;
      } catch (error) {
        return <div data-testid="error-message">{(error as Error).message}</div>;
      }
    }

    render(<ComponentWithoutProvider />);

    expect(screen.getByTestId('error-message')).toHaveTextContent(
      'useTheme must be used within a ThemeProvider'
    );

    consoleError.mockRestore();
  });

  it('should render children within ThemeProvider', () => {
    render(
      <ThemeProvider>
        <div data-testid="test-child">Test Child</div>
      </ThemeProvider>
    );

    expect(screen.getByTestId('test-child')).toBeInTheDocument();
  });
});
