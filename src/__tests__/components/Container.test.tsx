import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import Container from '@/components/ui/Container';

describe('Container Component', () => {
  it('should render container with children', () => {
    render(<Container>Test Content</Container>);
    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('should apply default size (lg)', () => {
    const { container } = render(<Container>Content</Container>);
    const divElement = container.firstChild;
    expect(divElement).toHaveClass('max-w-7xl');
  });

  it('should apply custom size - sm', () => {
    const { container } = render(<Container size="sm">Content</Container>);
    const divElement = container.firstChild;
    expect(divElement).toHaveClass('max-w-3xl');
  });

  it('should apply custom size - md', () => {
    const { container } = render(<Container size="md">Content</Container>);
    const divElement = container.firstChild;
    expect(divElement).toHaveClass('max-w-5xl');
  });

  it('should apply custom size - lg', () => {
    const { container } = render(<Container size="lg">Content</Container>);
    const divElement = container.firstChild;
    expect(divElement).toHaveClass('max-w-7xl');
  });

  it('should apply custom size - xl', () => {
    const { container } = render(<Container size="xl">Content</Container>);
    const divElement = container.firstChild;
    expect(divElement).toHaveClass('max-w-[1400px]');
  });

  it('should apply custom size - full', () => {
    const { container } = render(<Container size="full">Content</Container>);
    const divElement = container.firstChild;
    expect(divElement).toHaveClass('max-w-full');
  });

  it('should apply custom className', () => {
    const { container } = render(<Container className="custom-container">Content</Container>);
    const divElement = container.firstChild;
    expect(divElement).toHaveClass('custom-container');
  });

  it('should have proper base styles', () => {
    const { container } = render(<Container>Content</Container>);
    const divElement = container.firstChild;
    expect(divElement).toHaveClass('mx-auto', 'px-4');
  });
});
