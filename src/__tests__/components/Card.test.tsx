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
});
