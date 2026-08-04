import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import ImpactMetrics from '@/components/ImpactMetrics';

describe('ImpactMetrics', () => {
  it('renders the section heading', () => {
    render(<ImpactMetrics />);
    expect(
      screen.getByRole('heading', { level: 2, name: /impact by the numbers/i }),
    ).toBeInTheDocument();
  });

  it('shows four-to-six strong, résumé-verified figures (#192)', () => {
    render(<ImpactMetrics />);
    const items = screen.getAllByRole('listitem');
    expect(items.length).toBeGreaterThanOrEqual(4);
    expect(items.length).toBeLessThanOrEqual(6);
    for (const value of ['$2M', '83%', '99.99%', '72%', '90%', '68%']) {
      expect(screen.getByText(value)).toBeInTheDocument();
    }
  });

  it('drops the unbaselined "Billions" hyperbole (#192)', () => {
    render(<ImpactMetrics />);
    expect(screen.queryByText(/billions/i)).not.toBeInTheDocument();
  });

  it('gives every metric measurable context — the workflow and where (#192)', () => {
    render(<ImpactMetrics />);
    // Every card carries a context sentence naming the role, not just a number.
    for (const item of screen.getAllByRole('listitem')) {
      expect(item.textContent).toMatch(
        /Evonik|Amazon Robotics|Very Technology|MojoTech|Bank of America/,
      );
    }
    // A baseline and a timeframe are spelled out for non-technical readers.
    expect(screen.getByText(/under ~1 minute of downtime a week/i)).toBeInTheDocument();
    expect(screen.getByText(/within three weeks/i)).toBeInTheDocument();
  });
});
