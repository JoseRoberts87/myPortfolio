import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import Button from '@/components/ui/Button';

describe('Button Component', () => {
  it('should render button with children', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole('button')).toBeInTheDocument();
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('should render each variant with a distinct className', () => {
    const variants = ['primary', 'secondary', 'outline', 'ghost'] as const;
    const classNames = variants.map((variant) => {
      const { container } = render(<Button variant={variant}>Variant</Button>);
      return (container.firstChild as HTMLElement).className;
    });

    // Each variant must produce a unique className so the variants stay visually distinct.
    // This survives token/palette changes while still proving variants differ.
    expect(new Set(classNames).size).toBe(variants.length);
  });

  it('should render each size with a distinct className', () => {
    const sizes = ['sm', 'md', 'lg'] as const;
    const classNames = sizes.map((size) => {
      const { container } = render(<Button size={size}>Size</Button>);
      return (container.firstChild as HTMLElement).className;
    });

    expect(new Set(classNames).size).toBe(sizes.length);
  });

  it('should take full width only when fullWidth is set', () => {
    const { container, rerender } = render(<Button>Auto</Button>);
    expect(container.firstChild as HTMLElement).not.toHaveClass('w-full');

    rerender(<Button fullWidth>Full</Button>);
    expect(container.firstChild as HTMLElement).toHaveClass('w-full');
  });

  it('should forward a custom className', () => {
    render(<Button className="custom-class">Custom</Button>);
    expect(screen.getByRole('button')).toHaveClass('custom-class');
  });

  it('should be disabled when the disabled prop is set', () => {
    render(<Button disabled>Disabled</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('should call onClick when clicked', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click</Button>);

    fireEvent.click(screen.getByRole('button'));

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('should not call onClick when disabled', () => {
    const handleClick = jest.fn();
    render(
      <Button disabled onClick={handleClick}>
        Disabled
      </Button>
    );

    fireEvent.click(screen.getByRole('button'));

    expect(handleClick).not.toHaveBeenCalled();
  });
});
