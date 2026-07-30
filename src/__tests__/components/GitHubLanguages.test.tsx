import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import GitHubLanguages from '@/components/GitHub/GitHubLanguages';
import type { LanguageStat } from '@/types/github';

// Recharts relies on ResizeObserver / layout which jsdom does not provide, so we
// stub the chart primitives (matching the house style used in SkillsMatrix.test).
jest.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="responsive-container">{children}</div>
  ),
  PieChart: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="pie-chart">{children}</div>
  ),
  Pie: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="pie">{children}</div>
  ),
  Cell: () => <div data-testid="cell" />,
  Legend: () => <div data-testid="legend" />,
  Tooltip: () => <div data-testid="tooltip" />,
}));

const languages: LanguageStat[] = [
  { name: 'TypeScript', bytes: 50000, percentage: 50, color: '#3178c6' },
  { name: 'Python', bytes: 30000, percentage: 30, color: '#3572A5' },
  { name: 'JavaScript', bytes: 20000, percentage: 20, color: '#f1e05a' },
];

describe('GitHubLanguages', () => {
  it('renders the heading and the pie chart container', () => {
    render(<GitHubLanguages languages={languages} />);

    expect(
      screen.getByRole('heading', { name: /Language Distribution/i })
    ).toBeInTheDocument();
    expect(screen.getByTestId('pie-chart')).toBeInTheDocument();
    expect(screen.getByText('Top Languages')).toBeInTheDocument();
  });

  it('lists each language name with its formatted percentage', () => {
    render(<GitHubLanguages languages={languages} />);

    expect(screen.getByText('TypeScript')).toBeInTheDocument();
    expect(screen.getByText('Python')).toBeInTheDocument();
    expect(screen.getByText('JavaScript')).toBeInTheDocument();

    expect(screen.getByText('50.0%')).toBeInTheDocument();
    expect(screen.getByText('30.0%')).toBeInTheDocument();
    expect(screen.getByText('20.0%')).toBeInTheDocument();
  });

  it('summarizes the language count (pluralized)', () => {
    render(<GitHubLanguages languages={languages} />);

    expect(
      screen.getByText(/Based on 3 most used languages across all repositories/i)
    ).toBeInTheDocument();
  });

  it('uses the singular form when there is a single language', () => {
    render(
      <GitHubLanguages
        languages={[{ name: 'Rust', bytes: 100, percentage: 100, color: '#dea584' }]}
      />
    );

    expect(
      screen.getByText(/Based on 1 most used language across all repositories/i)
    ).toBeInTheDocument();
  });

  it('renders an empty-state message when there is no language data', () => {
    render(<GitHubLanguages languages={[]} />);

    expect(screen.getByText(/No language data available/i)).toBeInTheDocument();
    expect(screen.queryByTestId('pie-chart')).not.toBeInTheDocument();
  });
});
