import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import ThemeToggle from '@/components/ThemeToggle';
import { ThemeProvider } from '@/contexts/ThemeContext';

const renderWithTheme = () =>
  render(
    <ThemeProvider>
      <ThemeToggle />
    </ThemeProvider>
  );

describe('ThemeToggle', () => {
  beforeEach(() => {
    // Guarantee a clean starting point for the shared document element between tests.
    document.documentElement.classList.remove('dark');
  });

  it('renders an accessible toggle button', () => {
    renderWithTheme();
    const button = screen.getByRole('button', { name: /switch to .+ mode/i });
    expect(button).toBeInTheDocument();
  });

  it('resolves to light mode on mount given no saved preference (matchMedia mock)', () => {
    renderWithTheme();
    // jest.setup mocks matchMedia -> matches:false and localStorage -> empty,
    // so the provider's mount effect settles on the light theme.
    expect(document.documentElement.classList.contains('dark')).toBe(false);
    expect(screen.getByRole('button')).toHaveAttribute('aria-label', 'Switch to dark mode');
  });

  it('toggles the theme in both directions when clicked', () => {
    renderWithTheme();
    const button = screen.getByRole('button');

    // Starts in light mode.
    expect(document.documentElement.classList.contains('dark')).toBe(false);
    expect(button).toHaveAttribute('aria-label', 'Switch to dark mode');

    // Toggle ON: light -> dark.
    fireEvent.click(button);
    expect(document.documentElement.classList.contains('dark')).toBe(true);
    expect(button).toHaveAttribute('aria-label', 'Switch to light mode');

    // Toggle OFF: dark -> light.
    fireEvent.click(button);
    expect(document.documentElement.classList.contains('dark')).toBe(false);
    expect(button).toHaveAttribute('aria-label', 'Switch to dark mode');
  });
});
