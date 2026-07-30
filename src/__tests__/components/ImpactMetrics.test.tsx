import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import ImpactMetrics from '@/components/ImpactMetrics';

describe('ImpactMetrics', () => {
  it('renders the section heading', () => {
    render(<ImpactMetrics />);
    expect(
      screen.getByRole('heading', { level: 2, name: /impact by the numbers/i })
    ).toBeInTheDocument();
  });

  it('renders all six headline metrics', () => {
    render(<ImpactMetrics />);
    expect(screen.getByText('72%')).toBeInTheDocument();
    expect(screen.getByText('90%')).toBeInTheDocument();
    expect(screen.getByText('$2M')).toBeInTheDocument();
    expect(screen.getByText('83%')).toBeInTheDocument();
    expect(screen.getByText('99.99%')).toBeInTheDocument();
    expect(screen.getByText('Billions')).toBeInTheDocument();
  });

  it('labels each metric for context', () => {
    render(<ImpactMetrics />);
    expect(screen.getByText('Fortune 500 growth')).toBeInTheDocument();
    expect(screen.getByText('Platform uptime')).toBeInTheDocument();
    expect(screen.getByText('Dollars recovered')).toBeInTheDocument();
  });

  it('renders one card per metric', () => {
    const { container } = render(<ImpactMetrics />);
    // Each metric card is a bordered rounded tile in the grid.
    expect(container.querySelectorAll('.grid > div')).toHaveLength(6);
  });
});
