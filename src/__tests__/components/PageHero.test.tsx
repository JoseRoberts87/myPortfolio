import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { PageHero } from '@/components/ui';

describe('PageHero', () => {
  it('renders the title as the page h1', () => {
    render(<PageHero title="Data Pipelines" />);
    const h1 = screen.getByRole('heading', { level: 1 });
    expect(h1).toHaveTextContent('Data Pipelines');
  });

  it('renders the tagline when provided', () => {
    render(<PageHero title="X" tagline="Real-time ingestion" />);
    expect(screen.getByText('Real-time ingestion')).toBeInTheDocument();
  });

  it('renders an eyebrow kicker when provided', () => {
    const { container } = render(<PageHero title="X" eyebrow="Case Studies" tagline="tag" />);
    expect(screen.getByText('Case Studies')).toBeInTheDocument();
    // eyebrow + tagline => two <p> elements
    expect(container.querySelectorAll('p')).toHaveLength(2);
  });

  it('omits the eyebrow when not provided', () => {
    const { container } = render(<PageHero title="X" tagline="tag" />);
    // tagline only
    expect(container.querySelectorAll('p')).toHaveLength(1);
  });

  it('renders a badge for each entry', () => {
    render(<PageHero title="X" badges={['NumPy', 'SciPy', 'FFT']} />);
    expect(screen.getByText('NumPy')).toBeInTheDocument();
    expect(screen.getByText('SciPy')).toBeInTheDocument();
    expect(screen.getByText('FFT')).toBeInTheDocument();
  });

  it('renders children in the supporting slot', () => {
    render(
      <PageHero title="X">
        <button>Time Range</button>
      </PageHero>
    );
    expect(screen.getByRole('button', { name: 'Time Range' })).toBeInTheDocument();
  });
});
