import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import Section from '@/components/ui/Section';

// Return the root element's className for a given padding prop, so tests can
// assert the prop→output CONTRACT (distinct classes) without hardcoding the
// Tailwind token values (which would red-line on spacing/token changes).
const rootClass = (padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl') => {
  const { container } = render(<Section padding={padding}>Content</Section>);
  return (container.firstChild as HTMLElement).className;
};

describe('Section Component', () => {
  it('renders its children', () => {
    render(<Section>Test Section</Section>);
    expect(screen.getByText('Test Section')).toBeInTheDocument();
  });

  it('renders a <section> element', () => {
    const { container } = render(<Section>Content</Section>);
    expect(container.querySelector('section')).toBeInTheDocument();
  });

  it('maps each padding size to a distinct class', () => {
    // Behavior contract: every padding value produces a different output.
    const classes = (['none', 'sm', 'md', 'lg', 'xl'] as const).map(rootClass);
    expect(new Set(classes).size).toBe(classes.length);
  });

  it('applies no vertical padding utility when padding="none"', () => {
    expect(rootClass('none')).not.toMatch(/\bpy-\d/);
    expect(rootClass('lg')).toMatch(/\bpy-\d/);
  });

  it('forwards a custom className', () => {
    const { container } = render(<Section className="custom-section">Content</Section>);
    expect(container.firstChild).toHaveClass('custom-section');
  });

  it('supports an id attribute', () => {
    const { container } = render(<Section id="test-section">Content</Section>);
    expect(container.querySelector('#test-section')).toBeInTheDocument();
  });
});
