import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import Badge from '@/components/ui/Badge';

describe('Badge Component', () => {
  it('should render badge with children', () => {
    render(<Badge>Test Badge</Badge>);
    expect(screen.getByText('Test Badge')).toBeInTheDocument();
  });

  it('should apply default variant (primary)', () => {
    render(<Badge>Default</Badge>);
    const badge = screen.getByText('Default');
    expect(badge).toHaveClass('bg-purple-600/20');
  });

  it('should apply secondary variant', () => {
    render(<Badge variant="secondary">Secondary</Badge>);
    const badge = screen.getByText('Secondary');
    expect(badge).toHaveClass('bg-slate-700/50');
  });

  it('should apply error variant', () => {
    render(<Badge variant="error">Error</Badge>);
    const badge = screen.getByText('Error');
    expect(badge).toHaveClass('bg-red-600/20');
  });

  it('should apply info variant', () => {
    render(<Badge variant="info">Info</Badge>);
    const badge = screen.getByText('Info');
    expect(badge).toHaveClass('bg-blue-600/20');
  });

  it('should apply success variant', () => {
    render(<Badge variant="success">Success</Badge>);
    const badge = screen.getByText('Success');
    expect(badge).toHaveClass('bg-green-600/20');
  });

  it('should apply warning variant', () => {
    render(<Badge variant="warning">Warning</Badge>);
    const badge = screen.getByText('Warning');
    expect(badge).toHaveClass('bg-yellow-600/20');
  });

  it('should apply custom className', () => {
    render(<Badge className="custom-badge">Custom</Badge>);
    const badge = screen.getByText('Custom');
    expect(badge).toHaveClass('custom-badge');
  });

  it('should have proper base styles', () => {
    render(<Badge>Styled</Badge>);
    const badge = screen.getByText('Styled');
    expect(badge).toHaveClass('inline-flex', 'rounded-full');
  });
});
