/**
 * Tests for Card component
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
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

  it('should apply variant classes', () => {
    const { container } = render(
      <Card variant="bordered">
        <p>Bordered Card</p>
      </Card>
    );

    const card = container.firstChild as HTMLElement;
    expect(card.className).toContain('border');
  });

  it('should apply padding classes', () => {
    const { container } = render(
      <Card padding="lg">
        <p>Large Padding</p>
      </Card>
    );

    const card = container.firstChild as HTMLElement;
    // Check that some padding class is applied
    expect(card.className).toContain('p-');
  });

  it('should apply custom className', () => {
    const { container } = render(
      <Card className="custom-class">
        <p>Custom Class</p>
      </Card>
    );

    const card = container.firstChild as HTMLElement;
    expect(card).toHaveClass('custom-class');
  });

  it('should render with different variants', () => {
    const { rerender, container } = render(
      <Card variant="default">Default</Card>
    );

    let card = container.firstChild as HTMLElement;
    const defaultClasses = card.className;

    rerender(<Card variant="bordered">Bordered</Card>);
    card = container.firstChild as HTMLElement;
    const borderedClasses = card.className;

    // Classes should be different for different variants
    expect(defaultClasses).not.toBe(borderedClasses);
  });

  it('should apply hover styles when hover prop is true', () => {
    const { container } = render(
      <Card hover>
        <p>Hover Card</p>
      </Card>
    );

    const card = container.firstChild as HTMLElement;
    expect(card).toHaveClass('hover:scale-105');
    expect(card).toHaveClass('cursor-pointer');
  });

  it('should not apply hover styles when hover prop is false', () => {
    const { container } = render(
      <Card hover={false}>
        <p>No Hover</p>
      </Card>
    );

    const card = container.firstChild as HTMLElement;
    expect(card).not.toHaveClass('hover:scale-105');
    expect(card).not.toHaveClass('cursor-pointer');
  });

  it('should render elevated variant', () => {
    const { container } = render(
      <Card variant="elevated">
        <p>Elevated Card</p>
      </Card>
    );

    const card = container.firstChild as HTMLElement;
    expect(card).toHaveClass('bg-slate-800');
    expect(card).toHaveClass('shadow-lg');
  });

  it('should apply padding none', () => {
    const { container } = render(
      <Card padding="none">
        <p>No Padding</p>
      </Card>
    );

    const card = container.firstChild as HTMLElement;
    expect(card).not.toHaveClass('p-4');
    expect(card).not.toHaveClass('p-6');
    expect(card).not.toHaveClass('p-8');
  });

  it('should apply small padding', () => {
    const { container } = render(
      <Card padding="sm">
        <p>Small Padding</p>
      </Card>
    );

    const card = container.firstChild as HTMLElement;
    expect(card).toHaveClass('p-4');
  });

  it('should apply medium padding by default', () => {
    const { container } = render(
      <Card>
        <p>Default Padding</p>
      </Card>
    );

    const card = container.firstChild as HTMLElement;
    expect(card).toHaveClass('p-6');
  });
});
