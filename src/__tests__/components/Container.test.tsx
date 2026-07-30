import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import Container from '@/components/ui/Container';

// Return the root element's className for a given size prop, so tests assert
// the prop→output CONTRACT (distinct max-width per size) without hardcoding
// the Tailwind token values.
const rootClass = (size?: 'sm' | 'md' | 'lg' | 'xl' | 'full') => {
  const { container } = render(<Container size={size}>Content</Container>);
  return (container.firstChild as HTMLElement).className;
};

describe('Container Component', () => {
  it('renders its children', () => {
    render(<Container>Test Content</Container>);
    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('maps each size to a distinct class', () => {
    // Behavior contract: every size value produces a different max-width output.
    const classes = (['sm', 'md', 'lg', 'xl', 'full'] as const).map(rootClass);
    expect(new Set(classes).size).toBe(classes.length);
  });

  it('defaults to the same output as size="lg"', () => {
    expect(rootClass(undefined)).toBe(rootClass('lg'));
  });

  it('forwards a custom className', () => {
    const { container } = render(<Container className="custom-container">Content</Container>);
    expect(container.firstChild).toHaveClass('custom-container');
  });
});
