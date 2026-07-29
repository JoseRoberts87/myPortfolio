import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import Certifications from '@/components/Certifications';

describe('Certifications', () => {
  it('renders the section heading', () => {
    render(<Certifications />);
    expect(
      screen.getByRole('heading', { level: 2, name: /certifications/i })
    ).toBeInTheDocument();
  });

  it('renders all three certifications with their issuers', () => {
    render(<Certifications />);
    expect(screen.getByText('Databricks Certified Data Engineer Professional')).toBeInTheDocument();
    expect(screen.getByText('Databricks')).toBeInTheDocument();
    expect(screen.getByText(/AWS Certified Solutions Architect/)).toBeInTheDocument();
    expect(screen.getByText('Amazon Web Services')).toBeInTheDocument();
    expect(screen.getByText('TinyML Certification')).toBeInTheDocument();
    expect(screen.getByText('Harvard edX')).toBeInTheDocument();
  });

  it('renders each certification as its own level-3 heading', () => {
    render(<Certifications />);
    expect(screen.getAllByRole('heading', { level: 3 })).toHaveLength(3);
  });

  it('shows the validity/status pill for each cert', () => {
    render(<Certifications />);
    expect(screen.getByText(/2026/)).toBeInTheDocument();
    expect(screen.getAllByText('Certified')).toHaveLength(2);
  });
});
