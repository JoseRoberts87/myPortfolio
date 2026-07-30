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
    render(<ImpactMetrics />);
    // Each of the six metric cards contributes its own supporting detail line;
    // asserting all six render proves one card per metric without counting DOM
    // nodes by layout class.
    expect(screen.getByText(/Analytics-platform growth via Databricks/i)).toBeInTheDocument();
    expect(screen.getByText(/AI-first system delivered in 3 weeks/i)).toBeInTheDocument();
    expect(screen.getByText(/ML forecasting model in one year/i)).toBeInTheDocument();
    expect(screen.getByText(/Predictive maintenance/i)).toBeInTheDocument();
    expect(screen.getByText(/Real-time IoT platform/i)).toBeInTheDocument();
    expect(screen.getByText(/Deposit-account analytics/i)).toBeInTheDocument();
  });
});
