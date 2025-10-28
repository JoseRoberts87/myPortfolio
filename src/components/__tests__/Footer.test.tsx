import { render, screen } from '@testing-library/react';
import Footer from '../Footer';

describe('Footer Component', () => {
  it('renders the brand name', () => {
    render(<Footer />);
    const brandName = screen.getByText('Portfolio');
    expect(brandName).toBeInTheDocument();
  });

  it('renders the brand description', () => {
    render(<Footer />);
    const description = screen.getByText(/Showcasing expertise in web development/i);
    expect(description).toBeInTheDocument();
  });

  it('renders all expertise area links', () => {
    render(<Footer />);

    expect(screen.getByRole('link', { name: 'Web Development' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Data Pipelines' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Analytics' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Machine Learning' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Computer Vision' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Cloud & DevOps' })).toBeInTheDocument();
  });

  it('renders social media links with correct attributes', () => {
    render(<Footer />);

    const githubLink = screen.getByRole('link', { name: 'GitHub' });
    const linkedinLink = screen.getByRole('link', { name: 'LinkedIn' });
    const twitterLink = screen.getByRole('link', { name: 'Twitter' });

    // Check links are present
    expect(githubLink).toBeInTheDocument();
    expect(linkedinLink).toBeInTheDocument();
    expect(twitterLink).toBeInTheDocument();

    // Check they open in new tab
    expect(githubLink).toHaveAttribute('target', '_blank');
    expect(linkedinLink).toHaveAttribute('target', '_blank');
    expect(twitterLink).toHaveAttribute('target', '_blank');

    // Check security attributes
    expect(githubLink).toHaveAttribute('rel', 'noopener noreferrer');
    expect(linkedinLink).toHaveAttribute('rel', 'noopener noreferrer');
    expect(twitterLink).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('renders resources section with links', () => {
    render(<Footer />);

    expect(screen.getByRole('link', { name: 'Documentation' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Contact' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Resume' })).toBeInTheDocument();
  });

  it('displays current year in copyright', () => {
    render(<Footer />);
    const currentYear = new Date().getFullYear();
    const copyright = screen.getByText(new RegExp(`© ${currentYear}`));
    expect(copyright).toBeInTheDocument();
  });

  it('displays tech stack information', () => {
    render(<Footer />);
    const techStack = screen.getByText(/Built with Next.js, React, TypeScript, and Tailwind CSS/i);
    expect(techStack).toBeInTheDocument();
  });

  it('has proper section headings', () => {
    render(<Footer />);

    expect(screen.getByText('Expertise Areas')).toBeInTheDocument();
    expect(screen.getByText('Resources')).toBeInTheDocument();
  });

  it('uses semantic HTML footer tag', () => {
    const { container } = render(<Footer />);
    const footer = container.querySelector('footer');
    expect(footer).toBeInTheDocument();
  });

  it('has responsive grid layout classes', () => {
    const { container } = render(<Footer />);
    const gridContainer = container.querySelector('.grid');
    expect(gridContainer).toHaveClass('grid-cols-1', 'md:grid-cols-3');
  });

  it('renders SVG icons for social media', () => {
    render(<Footer />);

    const githubLink = screen.getByRole('link', { name: 'GitHub' });
    const linkedinLink = screen.getByRole('link', { name: 'LinkedIn' });
    const twitterLink = screen.getByRole('link', { name: 'Twitter' });

    // Check each link contains an SVG
    expect(githubLink.querySelector('svg')).toBeInTheDocument();
    expect(linkedinLink.querySelector('svg')).toBeInTheDocument();
    expect(twitterLink.querySelector('svg')).toBeInTheDocument();
  });

  it('has hover effects on links', () => {
    render(<Footer />);

    const webDevLink = screen.getByRole('link', { name: 'Web Development' });
    expect(webDevLink).toHaveClass('hover:text-white');
  });

  it('uses consistent color scheme', () => {
    const { container } = render(<Footer />);
    const footer = container.querySelector('footer');
    expect(footer).toHaveClass('bg-slate-900', 'border-t', 'border-slate-800');
  });
});
