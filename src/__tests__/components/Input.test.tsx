import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import Input from '@/components/ui/Input';

describe('Input Component', () => {
  it('should render input element', () => {
    render(<Input />);
    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });

  it('should apply placeholder', () => {
    render(<Input placeholder="Enter text" />);
    expect(screen.getByPlaceholderText('Enter text')).toBeInTheDocument();
  });

  it('should accept user input', async () => {
    const user = userEvent.setup();
    render(<Input />);
    const input = screen.getByRole('textbox');

    await user.type(input, 'Hello World');
    expect(input).toHaveValue('Hello World');
  });

  it('should apply custom className', () => {
    render(<Input className="custom-input" />);
    const input = screen.getByRole('textbox');
    expect(input).toHaveClass('custom-input');
  });

  it('should be disabled when disabled prop is true', () => {
    render(<Input disabled />);
    const input = screen.getByRole('textbox');
    expect(input).toBeDisabled();
  });

  it('should have proper type attribute', () => {
    render(<Input type="email" />);
    const input = screen.getByRole('textbox');
    expect(input).toHaveAttribute('type', 'email');
  });

  it('should handle password type', () => {
    const { container } = render(<Input type="password" />);
    const input = container.querySelector('input[type="password"]');
    expect(input).toBeInTheDocument();
  });

  it('should apply default styles', () => {
    render(<Input />);
    const input = screen.getByRole('textbox');
    expect(input).toHaveClass('bg-slate-800', 'border', 'rounded-lg', 'px-4', 'py-3');
  });

  it('should support ref forwarding', () => {
    const ref = React.createRef<HTMLInputElement>();
    render(<Input ref={ref} />);
    expect(ref.current).toBeInstanceOf(HTMLInputElement);
  });
});
