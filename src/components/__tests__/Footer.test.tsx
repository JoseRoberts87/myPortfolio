import { render, screen, within } from '@testing-library/react';
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
    expect(screen.getByRole('link', { name: 'Signal Processing' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Cloud & DevOps' })).toBeInTheDocument();
  });

  it('renders social media links with correct attributes', () => {
    const { container } = render(<Footer />);
    const social = within(container.querySelector('.flex.space-x-4') as HTMLElement);

    const githubLink = social.getByRole('link', { name: 'GitHub' });
    const linkedinLink = social.getByRole('link', { name: 'LinkedIn' });

    // Real profile URLs (not the previous generic placeholders)
    expect(githubLink).toHaveAttribute('href', 'https://github.com/JoseRoberts87');
    expect(linkedinLink).toHaveAttribute('href', 'https://www.linkedin.com/in/jose-roberts');

    for (const link of [githubLink, linkedinLink]) {
      expect(link).toHaveAttribute('target', '_blank');
      expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    }

    // The placeholder Twitter link was removed.
    expect(social.queryByRole('link', { name: 'Twitter' })).not.toBeInTheDocument();
  });

  it('displays location and availability', () => {
    render(<Footer />);
    expect(screen.getByText('Providence, RI')).toBeInTheDocument();
    expect(screen.getByText(/Open to Data & AI Architect roles/)).toBeInTheDocument();
  });

  it('renders resources section with links', () => {
    render(<Footer />);

    // The dead "Documentation" -> /docs (404) link was removed.
    expect(screen.queryByRole('link', { name: 'Documentation' })).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Case Studies' })).toHaveAttribute('href', '/case-studies');
    expect(screen.getByRole('link', { name: 'GitHub Activity' })).toHaveAttribute('href', '/github');
    expect(screen.getByRole('link', { name: 'Contact' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Resume' })).toBeInTheDocument();
  });

  it('uses absolute home anchors for Contact and Resume so they work from any page', () => {
    render(<Footer />);
    // Bare "#contact"/"#resume" only resolve on the homepage; "/#..." works everywhere.
    expect(screen.getByRole('link', { name: 'Contact' })).toHaveAttribute('href', '/#contact');
    expect(screen.getByRole('link', { name: 'Resume' })).toHaveAttribute('href', '/#resume');
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
    const { container } = render(<Footer />);
    const social = within(container.querySelector('.flex.space-x-4') as HTMLElement);

    expect(social.getByRole('link', { name: 'GitHub' }).querySelector('svg')).toBeInTheDocument();
    expect(social.getByRole('link', { name: 'LinkedIn' }).querySelector('svg')).toBeInTheDocument();
  });

  it('has hover effects on links', () => {
    render(<Footer />);

    const webDevLink = screen.getByRole('link', { name: 'Web Development' });
    expect(webDevLink).toHaveClass('hover:text-slate-900', 'dark:hover:text-white');
  });

  it('uses consistent color scheme', () => {
    const { container } = render(<Footer />);
    const footer = container.querySelector('footer');
    expect(footer).toHaveClass('bg-surface-alt', 'border-t', 'border-slate-200', 'dark:border-slate-800');
  });
});
