import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import Section from '@/components/ui/Section';

describe('Section Component', () => {
  it('should render section with children', () => {
    render(<Section>Test Section</Section>);
    expect(screen.getByText('Test Section')).toBeInTheDocument();
  });

  it('should render as section element by default', () => {
    const { container } = render(<Section>Content</Section>);
    expect(container.querySelector('section')).toBeInTheDocument();
  });

  it('should apply default padding', () => {
    const { container } = render(<Section>Content</Section>);
    const section = container.firstChild;
    expect(section).toHaveClass('py-16');
  });

  it('should apply custom padding - sm', () => {
    const { container } = render(<Section padding="sm">Content</Section>);
    const section = container.firstChild;
    expect(section).toHaveClass('py-8');
  });

  it('should apply custom padding - md', () => {
    const { container } = render(<Section padding="md">Content</Section>);
    const section = container.firstChild;
    expect(section).toHaveClass('py-12');
  });

  it('should apply custom padding - lg', () => {
    const { container } = render(<Section padding="lg">Content</Section>);
    const section = container.firstChild;
    expect(section).toHaveClass('py-16');
  });

  it('should apply custom padding - xl', () => {
    const { container } = render(<Section padding="xl">Content</Section>);
    const section = container.firstChild;
    expect(section).toHaveClass('py-24');
  });

  it('should apply custom padding - none', () => {
    const { container } = render(<Section padding="none">Content</Section>);
    const section = container.firstChild;
    // padding="none" results in empty string, so no py-* class is added
    expect(section).not.toHaveClass('py-8');
    expect(section).not.toHaveClass('py-12');
  });

  it('should apply custom className', () => {
    const { container } = render(<Section className="custom-section">Content</Section>);
    const section = container.firstChild;
    expect(section).toHaveClass('custom-section');
  });

  it('should support id attribute', () => {
    const { container } = render(<Section id="test-section">Content</Section>);
    const section = container.querySelector('#test-section');
    expect(section).toBeInTheDocument();
  });
});
