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
});
