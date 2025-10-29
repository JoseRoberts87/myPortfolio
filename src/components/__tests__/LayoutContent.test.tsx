import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import LayoutContent from '@/components/LayoutContent';

// Mock the child components
jest.mock('@/components/Header', () => {
  return function MockHeader() {
    return <header data-testid="mock-header">Header</header>;
  };
});

jest.mock('@/components/Footer', () => {
  return function MockFooter() {
    return <footer data-testid="mock-footer">Footer</footer>;
  };
});

// Mock ThemeProvider to avoid localStorage issues
jest.mock('@/contexts/ThemeContext', () => ({
  ThemeProvider: ({ children }: { children: React.ReactNode }) => <div data-testid="theme-provider">{children}</div>,
}));

describe('LayoutContent Component', () => {
  it('should render children', () => {
    render(
      <LayoutContent>
        <div>Test Content</div>
      </LayoutContent>
    );
    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('should render Header component', () => {
    render(
      <LayoutContent>
        <div>Content</div>
      </LayoutContent>
    );
    expect(screen.getByTestId('mock-header')).toBeInTheDocument();
  });

  it('should render Footer component', () => {
    render(
      <LayoutContent>
        <div>Content</div>
      </LayoutContent>
    );
    expect(screen.getByTestId('mock-footer')).toBeInTheDocument();
  });

  it('should wrap content in ThemeProvider', () => {
    render(
      <LayoutContent>
        <div>Content</div>
      </LayoutContent>
    );
    expect(screen.getByTestId('theme-provider')).toBeInTheDocument();
  });

  it('should apply proper main tag styles', () => {
    const { container } = render(
      <LayoutContent>
        <div>Content</div>
      </LayoutContent>
    );
    const mainElement = container.querySelector('main');
    expect(mainElement).toHaveClass('flex-grow', 'pt-16');
  });

  it('should render main element between Header and Footer', () => {
    const { container } = render(
      <LayoutContent>
        <div>Content</div>
      </LayoutContent>
    );
    const themeProvider = container.querySelector('[data-testid="theme-provider"]');
    const header = screen.getByTestId('mock-header');
    const footer = screen.getByTestId('mock-footer');
    const main = container.querySelector('main');

    expect(themeProvider).toBeInTheDocument();
    expect(header).toBeInTheDocument();
    expect(main).toBeInTheDocument();
    expect(footer).toBeInTheDocument();
  });
});
