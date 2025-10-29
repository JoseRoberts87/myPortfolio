import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import Textarea from '@/components/ui/Textarea';

describe('Textarea Component', () => {
  it('should render textarea element', () => {
    render(<Textarea />);
    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });

  it('should apply placeholder', () => {
    render(<Textarea placeholder="Enter description" />);
    expect(screen.getByPlaceholderText('Enter description')).toBeInTheDocument();
  });

  it('should accept user input', async () => {
    const user = userEvent.setup();
    render(<Textarea />);
    const textarea = screen.getByRole('textbox');

    await user.type(textarea, 'Multi-line\ntext input');
    expect(textarea).toHaveValue('Multi-line\ntext input');
  });

  it('should apply custom className', () => {
    render(<Textarea className="custom-textarea" />);
    const textarea = screen.getByRole('textbox');
    expect(textarea).toHaveClass('custom-textarea');
  });

  it('should be disabled when disabled prop is true', () => {
    render(<Textarea disabled />);
    const textarea = screen.getByRole('textbox');
    expect(textarea).toBeDisabled();
  });

  it('should apply default styles', () => {
    render(<Textarea />);
    const textarea = screen.getByRole('textbox');
    expect(textarea).toHaveClass('bg-slate-800', 'border', 'rounded-lg', 'px-4', 'py-3');
  });

  it('should support ref forwarding', () => {
    const ref = React.createRef<HTMLTextAreaElement>();
    render(<Textarea ref={ref} />);
    expect(ref.current).toBeInstanceOf(HTMLTextAreaElement);
  });

  it('should support rows attribute', () => {
    render(<Textarea rows={5} />);
    const textarea = screen.getByRole('textbox');
    expect(textarea).toHaveAttribute('rows', '5');
  });

  it('should support maxLength attribute', () => {
    render(<Textarea maxLength={100} />);
    const textarea = screen.getByRole('textbox');
    expect(textarea).toHaveAttribute('maxLength', '100');
  });

  it('should render label when label prop is provided', () => {
    render(<Textarea label="Description" />);
    expect(screen.getByText('Description')).toBeInTheDocument();
  });

  it('should not render label when label prop is not provided', () => {
    const { container } = render(<Textarea />);
    const label = container.querySelector('label');
    expect(label).not.toBeInTheDocument();
  });

  it('should render error message when error prop is provided', () => {
    render(<Textarea error="This field is required" />);
    expect(screen.getByText('This field is required')).toBeInTheDocument();
  });

  it('should apply error border color when error prop is provided', () => {
    render(<Textarea error="Error message" />);
    const textarea = screen.getByRole('textbox');
    expect(textarea).toHaveClass('border-red-500');
  });

  it('should not apply error styles when error prop is not provided', () => {
    render(<Textarea />);
    const textarea = screen.getByRole('textbox');
    expect(textarea).not.toHaveClass('border-red-500');
    expect(textarea).toHaveClass('border-slate-700');
  });

  it('should render helper text when helperText prop is provided', () => {
    render(<Textarea helperText="Enter a detailed description" />);
    expect(screen.getByText('Enter a detailed description')).toBeInTheDocument();
  });

  it('should not render helper text when error is present', () => {
    render(<Textarea helperText="Helper text" error="Error message" />);
    expect(screen.queryByText('Helper text')).not.toBeInTheDocument();
    expect(screen.getByText('Error message')).toBeInTheDocument();
  });

  it('should apply full width when fullWidth prop is true', () => {
    const { container } = render(<Textarea fullWidth />);
    const wrapper = container.firstChild;
    expect(wrapper).toHaveClass('w-full');
    const textarea = screen.getByRole('textbox');
    expect(textarea).toHaveClass('w-full');
  });

  it('should not apply full width by default', () => {
    const { container } = render(<Textarea />);
    const wrapper = container.firstChild;
    expect(wrapper).not.toHaveClass('w-full');
  });

  it('should apply resize vertical by default', () => {
    render(<Textarea />);
    const textarea = screen.getByRole('textbox');
    expect(textarea).toHaveClass('resize-vertical');
  });

  it('should apply resize none when resize prop is none', () => {
    render(<Textarea resize="none" />);
    const textarea = screen.getByRole('textbox');
    expect(textarea).toHaveClass('resize-none');
  });

  it('should apply resize horizontal when resize prop is horizontal', () => {
    render(<Textarea resize="horizontal" />);
    const textarea = screen.getByRole('textbox');
    expect(textarea).toHaveClass('resize-horizontal');
  });

  it('should apply resize both when resize prop is both', () => {
    render(<Textarea resize="both" />);
    const textarea = screen.getByRole('textbox');
    expect(textarea).toHaveClass('resize-both');
  });

  it('should render with label, error, and fullWidth together', () => {
    const { container } = render(
      <Textarea label="Comments" error="Too short" fullWidth />
    );
    expect(screen.getByText('Comments')).toBeInTheDocument();
    expect(screen.getByText('Too short')).toBeInTheDocument();
    expect(container.firstChild).toHaveClass('w-full');
  });
});
