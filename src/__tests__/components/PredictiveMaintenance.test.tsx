import React from 'react';
import { render, screen, fireEvent, within } from '@testing-library/react';
import '@testing-library/jest-dom';
import PredictiveMaintenance from '@/components/MachineLearning/PredictiveMaintenance';

// Recharts needs canvas/layout jsdom lacks — stub the primitives (house pattern).
jest.mock('recharts', () => {
  const Passthrough = ({ children }: { children?: React.ReactNode }) => <div>{children}</div>;
  return {
    ResponsiveContainer: Passthrough,
    ComposedChart: Passthrough,
    Line: () => <div data-testid="line" />,
    Area: () => <div data-testid="area" />,
    XAxis: () => <div data-testid="x-axis" />,
    YAxis: () => <div data-testid="y-axis" />,
    CartesianGrid: () => <div data-testid="grid" />,
    Tooltip: () => <div data-testid="tooltip" />,
    ReferenceLine: () => <div data-testid="threshold" />,
  };
});

describe('PredictiveMaintenance', () => {
  it('renders the heading and résumé framing', () => {
    render(<PredictiveMaintenance />);
    expect(
      screen.getByRole('heading', { name: /Predictive Maintenance Forecasting/i }),
    ).toBeInTheDocument();
    expect(screen.getByText(/Holt.+double exponential smoothing/i)).toBeInTheDocument();
    expect(screen.getByText(/83% downtime reduction/i)).toBeInTheDocument();
  });

  it('renders the three sensor presets with the first selected', () => {
    render(<PredictiveMaintenance />);
    const vibration = screen.getByRole('button', { name: 'Bearing Vibration' });
    expect(vibration).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: 'Motor Temperature' })).toHaveAttribute('aria-pressed', 'false');
    expect(screen.getByRole('button', { name: 'Hydraulic Pressure' })).toBeInTheDocument();
  });

  it('switches the selected sensor on click', () => {
    render(<PredictiveMaintenance />);
    const temp = screen.getByRole('button', { name: 'Motor Temperature' });
    fireEvent.click(temp);
    expect(temp).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: 'Bearing Vibration' })).toHaveAttribute('aria-pressed', 'false');
  });

  it('shows an estimated-time-to-maintenance readout with a status badge', () => {
    render(<PredictiveMaintenance />);
    const label = screen.getByText('Estimated time to maintenance');
    // The big readout sits right after the label; it shows "~N days" (crossing)
    // or "> N days" (no crossing within the horizon).
    expect(label.nextElementSibling).toHaveTextContent(/(~|>)\s?\d+ days/);
  });

  it('updates the horizon label when the slider changes', () => {
    render(<PredictiveMaintenance />);
    const slider = screen.getByLabelText(/Forecast horizon/i);
    fireEvent.change(slider, { target: { value: '30' } });
    expect(screen.getByText(/Forecast horizon/i)).toHaveTextContent('30 days');
  });

  it('regenerates a new machine without crashing', () => {
    render(<PredictiveMaintenance />);
    fireEvent.click(screen.getByRole('button', { name: /Simulate new machine/i }));
    expect(
      screen.getByRole('heading', { name: /Predictive Maintenance Forecasting/i }),
    ).toBeInTheDocument();
  });

  it('renders the forecast chart with observed and forecast series + threshold', () => {
    render(<PredictiveMaintenance />);
    expect(screen.getAllByTestId('line')).toHaveLength(2); // observed + forecast
    expect(screen.getByTestId('area')).toBeInTheDocument(); // confidence band
    expect(screen.getByTestId('threshold')).toBeInTheDocument();
  });

  it('lists the forecasting method badges', () => {
    const { container } = render(<PredictiveMaintenance />);
    expect(within(container).getByText("Holt's Linear Trend")).toBeInTheDocument();
    expect(within(container).getByText('Remaining Useful Life')).toBeInTheDocument();
  });
});
