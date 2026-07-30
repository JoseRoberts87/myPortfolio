import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import Badge from '@/components/ui/Badge';

describe('Badge Component', () => {
  it('should render badge with children', () => {
    render(<Badge>Test Badge</Badge>);
    expect(screen.getByText('Test Badge')).toBeInTheDocument();
  });

  it('should render each variant with a distinct className', () => {
    const variants = ['primary', 'secondary', 'success', 'warning', 'error', 'info'] as const;
    const classNames = variants.map((variant) => {
      const { container } = render(<Badge variant={variant}>{variant}</Badge>);
      return (container.firstChild as HTMLElement).className;
    });

    // Every variant must produce a unique className, robust to palette/token changes.
    expect(new Set(classNames).size).toBe(variants.length);
  });

  it('should render each size with a distinct className', () => {
    const sizes = ['sm', 'md', 'lg'] as const;
    const classNames = sizes.map((size) => {
      const { container } = render(<Badge size={size}>{`size-${size}`}</Badge>);
      return (container.firstChild as HTMLElement).className;
    });

    expect(new Set(classNames).size).toBe(sizes.length);
  });

  it('should forward a custom className', () => {
    render(<Badge className="custom-badge">Custom</Badge>);
    expect(screen.getByText('Custom')).toHaveClass('custom-badge');
  });
});
