/**
 * Tests for Card component
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Card } from '@/components/ui';

describe('Card Component', () => {
  it('should render children correctly', () => {
    render(
      <Card>
        <p>Test Content</p>
      </Card>
    );

    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('should render each variant with a distinct className', () => {
    const variants = ['default', 'bordered', 'elevated'] as const;
    const classNames = variants.map((variant) => {
      const { container } = render(<Card variant={variant}>Variant</Card>);
      return (container.firstChild as HTMLElement).className;
    });

    // Each variant must produce a unique className (robust to token changes).
    expect(new Set(classNames).size).toBe(variants.length);
  });

  it('should render the elevated variant on the surface token', () => {
    const { container } = render(
      <Card variant="elevated">
        <p>Elevated Card</p>
      </Card>
    );

    // bg-surface is a semantic design token that is part of the elevated variant's API.
    expect(container.firstChild as HTMLElement).toHaveClass('bg-surface');
  });

  it('should render each padding size with a distinct className', () => {
    const paddings = ['none', 'sm', 'md', 'lg'] as const;
    const classNames = paddings.map((padding) => {
      const { container } = render(<Card padding={padding}>Padding</Card>);
      return (container.firstChild as HTMLElement).className;
    });

    // Each padding option must be distinct rather than asserting exact spacing values.
    expect(new Set(classNames).size).toBe(paddings.length);
  });

  it('should not apply any padding utility when padding is none', () => {
    const { container } = render(
      <Card padding="none">
        <p>No Padding</p>
      </Card>
    );

    const card = container.firstChild as HTMLElement;
    expect(card.className).not.toMatch(/\bp-\d/);
  });

  it('should apply the pointer affordance only when hover prop is set', () => {
    const { container, rerender } = render(
      <Card hover>
        <p>Hover Card</p>
      </Card>
    );
    expect(container.firstChild as HTMLElement).toHaveClass('cursor-pointer');

    rerender(
      <Card hover={false}>
        <p>No Hover</p>
      </Card>
    );
    expect(container.firstChild as HTMLElement).not.toHaveClass('cursor-pointer');
  });

  it('should forward a custom className', () => {
    const { container } = render(
      <Card className="custom-class">
        <p>Custom Class</p>
      </Card>
    );

    expect(container.firstChild as HTMLElement).toHaveClass('custom-class');
  });
});
